import { nextTick, type Ref } from 'vue'
import { isOverlapping, getNodeRect, type Rect } from './geometry'
import type { NodeData, ContextMenuData } from '../../types/canva'
import { findNodeDefinition } from '../../types/nodeRegistry'

let nextNodeId = 1 // global counter


interface Size {
  width: number
  height: number
}

function createTemporaryNodeElement(type: string): Size {
  const dummy = document.createElement('div')
  dummy.style.position = 'absolute'
  dummy.style.visibility = 'hidden'
  dummy.className = 'draggable'
  dummy.innerHTML = `<div>${type}</div>`
  document.body.appendChild(dummy)

  const width = dummy.offsetWidth || 120
  const height = dummy.offsetHeight || 60
  dummy.remove()

  return { width, height }
}

function findValidNodePosition(
  x: number,
  y: number,
  width: number,
  height: number,
  nodes: NodeData[],
  nodeElements?: (HTMLElement | null)[],
  step = 20,
  maxBounds = { maxX: 3000, maxY: 3000 }
): { x: number; y: number } {
  for (let offsetY = 0; offsetY < maxBounds.maxY; offsetY += step) {
    for (let offsetX = 0; offsetX < maxBounds.maxX; offsetX += step) {
      const candidate: Rect = { x: x + offsetX, y: y + offsetY, width, height }

      const overlaps = nodes.some((n, i) => {
        const el = nodeElements?.[i]
        const other: Rect = el
          ? getNodeRect(n, el)
          : { x: n.x, y: n.y, width, height } // fallback if no element

        return isOverlapping(candidate, other)
      })

      if (!overlaps) {
        return { x: candidate.x, y: candidate.y }
      }
    }
  }

  console.warn('Could not find non-overlapping space, placing with fallback.')
  return {
    x: x + Math.random() * 100,
    y: y + Math.random() * 100
  }
}



export async function addNode(
  type: string,
  contextMenu: ContextMenuData,
  nodes: Ref<NodeData[]>,
  nodeRefs?: Ref<(HTMLElement | null)[]> // optional now
) {
  await nextTick()

  const def = findNodeDefinition(type)
  if (!def) {
    console.warn(`Unknown node type: ${type}`)
    return
  }

  const { width, height } = createTemporaryNodeElement(def.version)
  const baseX = contextMenu.worldX
  const baseY = contextMenu.worldY

  const { x, y } = findValidNodePosition(baseX, baseY, width, height, nodes.value, nodeRefs?.value)


  const newNode: NodeData = {
    id: nextNodeId++,
    x,
    y,
    type: def.version,
    title: def.title,
    icon: def.icon,
    group: def.group
  }
  

  nodes.value.push(newNode)
  contextMenu.visible = false
}

export const addNodeFromVersion = (
  version: string,
  configPart: any
): number => {
  const def = findNodeDefinition(version)

  if (!def || !def.enabled) {
    throw new Error(`Node version "${version}" is not enabled or doesn't exist`)
  }

  const id = nodeId++

  const node: NodeData = {
    id,
    type: version,        // e.g., "API", "Rules"
    title: def.title,
    icon: def.icon,
    group: def.group,
    x,
    y: 200,
    fieldTree: undefined
  }

  nodes.value.push(node)

  nextTick(() => {
    const comp = nodeComponents.value[nodes.value.length - 1]
    if (comp && typeof comp.setConfig === 'function') {
      comp.setConfig(configPart)
    }
  })

  x += 350
  return id
}
