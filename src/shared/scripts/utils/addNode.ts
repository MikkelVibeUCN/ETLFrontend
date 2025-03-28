import { nextTick, type Ref } from 'vue'
import { isOverlapping, getNodeRect } from './geometry'
import type { NodeData, ContextMenuData } from '../../types/canva'

interface Size {
  width: number
  height: number
}

function createTemporaryNodeElement(type: string, name: string): Size {
  const dummy = document.createElement('div')
  dummy.style.position = 'absolute'
  dummy.style.visibility = 'hidden'
  dummy.className = 'draggable'
  dummy.innerHTML = `<div>${type}-${name}</div>`
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
  nodeRefs: Ref<(HTMLElement | null)[]>,
  nodes: NodeData[],
  maxBounds = { maxX: 3000, maxY: 3000 },
  step = 20
): { x: number; y: number } {
  for (let offsetY = 0; offsetY < maxBounds.maxY; offsetY += step) {
    for (let offsetX = 0; offsetX < maxBounds.maxX; offsetX += step) {
      const candidate = { x: x + offsetX, y: y + offsetY, width, height }

      const overlaps = nodes.some((n, i) => {
        const el = nodeRefs.value[i]
        if (!el) return false
        const other = getNodeRect(n, el)
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
  name: string,
  contextMenu: ContextMenuData,
  nodes: Ref<NodeData[]>,
  nodeRefs: Ref<(HTMLElement | null)[]>,
) {
  if (type !== 'extract') return

  await nextTick()

  const { width, height } = createTemporaryNodeElement(type, name)

  const baseX = contextMenu.worldX
  const baseY = contextMenu.worldY

  const { x, y } = findValidNodePosition(baseX, baseY, width, height, nodeRefs, nodes.value)

  const newNode: NodeData = {
    x,
    y,
    type: name,
    name
  }

  nodes.value.push(newNode)
  contextMenu.visible = false
}
