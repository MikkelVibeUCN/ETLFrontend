<template>
    <div
      class="main-view"
      :class="{ grabbing: state.cursor === 'grabbing' }"
      ref="viewContainer"
      @mousedown.right.prevent="handleMouseDown"
      @mouseup.prevent="handleMouseUp"
      @mousemove="handleMouseMove"
      @contextmenu.prevent
      @wheel.prevent="onWheel"
    >
      <div class="pan-zoom-container" :style="transformStyle">
        <svg
          class="connections-layer"
          :width="containerSize.width"
          :height="containerSize.height"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
            </marker>
          </defs>
  
          <line
            v-for="(edge, index) in edges"
            :key="'edge-' + index"
            :x1="edge.start.x"
            :y1="edge.start.y"
            :x2="edge.end.x"
            :y2="edge.end.y"
            stroke="#888"
            stroke-width="2"
            marker-end="url(#arrowhead)"
          />
  
          <line
            v-if="connectionStart"
            :x1="connectionStart.x"
            :y1="connectionStart.y"
            :x2="mouse.x"
            :y2="mouse.y"
            stroke="#aaa"
            stroke-dasharray="5,5"
          />
        </svg>
  
        <!-- ETL nodes -->
        <div
          v-for="(node, index) in nodes"
          :key="node.id"
          class="draggable"
          :ref="el => setNodeRef(index, el)"
          :data-id="node.id"
          :style="{ transform: `translate(${node.x}px, ${node.y}px)` }"
        >
          <ETLNodeWrapper
            :type="node.type"
            :component-props="node"
            @register-connectors="(id: number, refs: ConnectorRefs) => connectorMap.set(id, refs)"
            @dragstart="startNodeDrag(index, $event)"
            @start-connection="handleStartConnection"
            @finish-connection="handleFinishConnection"
          />
        </div>
      </div>
  
      <!-- Context menu -->
      <ContextMenu
        v-if="contextMenu.visible"
        :x="contextMenu.x"
        :y="contextMenu.y"
        @add-node="handleAddNode"
      />
    </div>
  </template>
  
  <script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, type Ref, type Component } from 'vue'
import ContextMenu from './ContextMenu.vue'
import ETLNodeWrapper from './ETLNodeWrapper.vue'
import { useCanvasControls } from './Extract/Scripts/useCanvasControls'
import { addNode } from '../shared/scripts/utils/addNode'
import type { NodeData, ContextMenuData } from '../shared/types/canva'

const viewContainer = ref<HTMLElement | null>(null)
const nodes = ref<NodeData[]>([])
const edges = ref<Edge[]>([])
const mouse = reactive({ x: 0, y: 0 })
const connectionStart = ref<{ nodeId: number; x: number; y: number } | null>(null)
const containerSize = reactive({ width: 0, height: 0 })

interface ConnectorRefs {
  in: HTMLElement
  out: HTMLElement
}

export interface Edge {
  fromNodeId: number
  toNodeId: number
  start: { x: number; y: number }
  end: { x: number; y: number }
}

const nodeRefs: Ref<(HTMLElement | null)[]> = ref([])
const connectorMap = new Map<number, ConnectorRefs>()

function setNodeRef(index: number, el: Element | Component | null) {
  nodeRefs.value[index] = el instanceof HTMLElement ? el : null
}

const contextMenu = reactive<ContextMenuData>({
  visible: false,
  x: 0,
  y: 0,
  worldX: 0,
  worldY: 0
})

const {
  transformStyle,
  state,
  scale,
  panOffset,
  startNodeDrag,
  handleMouseDown,
  handleMouseUp,
  handleMouseMove: handleMouseMoveCanvas,
  onWheel
} = useCanvasControls(viewContainer, nodes, nodeRefs, contextMenu)

function updateContainerBounds() {
  const rect = viewContainer.value?.getBoundingClientRect()
  if (!rect) return

  let maxX = 0
  let maxY = 0

  // 🧱 Include all nodes
  for (const node of nodes.value) {
    const ref = nodeRefs.value.find(n => n?.dataset.id === String(node.id))
    const width = ref?.offsetWidth || 100
    const height = ref?.offsetHeight || 50

    maxX = Math.max(maxX, node.x + width)
    maxY = Math.max(maxY, node.y + height)
  }

  // 🧷 Include all edge endpoints
  for (const edge of edges.value) {
    maxX = Math.max(maxX, edge.start.x, edge.end.x)
    maxY = Math.max(maxY, edge.start.y, edge.end.y)
  }

  // 🎯 Include mouse position if a connection is being drawn
  if (connectionStart.value) {
    maxX = Math.max(maxX, mouse.x)
    maxY = Math.max(maxY, mouse.y)
  }

  // Add margin and enforce minimum
  containerSize.width = Math.max(rect.width / scale.value, maxX + 100)
  containerSize.height = Math.max(rect.height / scale.value, maxY + 100)
}

function handleMouseMove(event: MouseEvent) {
  handleMouseMoveCanvas(event)
  const rect = viewContainer.value?.getBoundingClientRect()
  if (rect) {
    mouse.x = (event.clientX - rect.left - panOffset.x) / scale.value
    mouse.y = (event.clientY - rect.top - panOffset.y) / scale.value
  }

  updateContainerBounds()
}

function handleAddNode(type: string) {
  addNode(type, contextMenu, nodes, nodeRefs)
  updateContainerBounds()
}

function handleStartConnection(nodeId: number) {
  const connector = connectorMap.get(nodeId)?.out
  const containerRect = viewContainer.value?.getBoundingClientRect()
  if (!connector || !containerRect) return

  const rect = connector.getBoundingClientRect()
  connectionStart.value = {
    nodeId,
    x: (rect.left + rect.width / 2 - containerRect.left - panOffset.x) / scale.value,
    y: (rect.top + rect.height / 2 - containerRect.top - panOffset.y) / scale.value
  }
}

function handleFinishConnection(nodeId: number) {
  if (!connectionStart.value || connectionStart.value.nodeId === nodeId || !viewContainer.value) return

  const connector = connectorMap.get(nodeId)?.in
  const containerRect = viewContainer.value.getBoundingClientRect()
  if (!connector) return

  const rect = connector.getBoundingClientRect()
  const endX = (rect.left + rect.width / 2 - containerRect.left - panOffset.x) / scale.value
  const endY = (rect.top + rect.height / 2 - containerRect.top - panOffset.y) / scale.value

  edges.value.push({
    fromNodeId: connectionStart.value.nodeId,
    toNodeId: nodeId,
    start: { x: connectionStart.value.x, y: connectionStart.value.y },
    end: { x: endX, y: endY }
  })

  connectionStart.value = null
  updateContainerBounds()
}

function updateEdgePositions() {
  const containerRect = viewContainer.value?.getBoundingClientRect()
  if (!containerRect) return

  edges.value.forEach(edge => {
    const from = connectorMap.get(edge.fromNodeId)?.out
    const to = connectorMap.get(edge.toNodeId)?.in
    if (!from || !to) return

    const fromRect = from.getBoundingClientRect()
    const toRect = to.getBoundingClientRect()

    edge.start = {
      x: (fromRect.left + fromRect.width / 2 - containerRect.left - panOffset.x) / scale.value,
      y: (fromRect.top + fromRect.height / 2 - containerRect.top - panOffset.y) / scale.value
    }

    edge.end = {
      x: (toRect.left + toRect.width / 2 - containerRect.left - panOffset.x) / scale.value,
      y: (toRect.top + toRect.height / 2 - containerRect.top - panOffset.y) / scale.value
    }
  })
}

function animateEdgeUpdates() {
  updateEdgePositions()
  requestAnimationFrame(animateEdgeUpdates)
}

onMounted(() => {
  updateContainerBounds()
  window.addEventListener('resize', updateContainerBounds)

  window.addEventListener('click', (e) => {
    const menu = document.querySelector('.context-menu')
    if (!menu || !menu.contains(e.target as Node)) {
      contextMenu.visible = false
    }
  })

  requestAnimationFrame(animateEdgeUpdates)
})

// 🔍 Recalculate bounds after zoom
watch(scale, () => {
  updateContainerBounds()
})
</script>



  
  <style scoped>
  .main-view {
    flex: 1;
    border: 3px solid #888;
    overflow: hidden;
    position: relative;
    background-color: #1e1e1e;
    user-select: none;
    cursor: default;
  }
  
  .main-view.grabbing {
    cursor: grabbing !important;
  }
  
  .pan-zoom-container {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
  }
  
  .draggable {
    position: absolute;
    will-change: transform;
  }
  
  .connections-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 200;
  }
  </style>
  