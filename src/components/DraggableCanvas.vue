<template>
  <div class="main-view" :class="{ grabbing: state.cursor === 'grabbing' }" ref="viewContainer"
    @mousedown.right.prevent="handleMouseDown" @mouseup.prevent="handleMouseUp" @mousemove="handleMouseMove"
    @contextmenu.prevent @wheel.prevent="onWheel">
    <div class="pan-zoom-container" :style="transformStyle">
      <svg class="connections-layer" :width="containerSize.width" :height="containerSize.height">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
          </marker>
        </defs>

        <line v-for="(edge, index) in edges" :key="'edge-' + index" :x1="edge.start.x" :y1="edge.start.y"
          :x2="edge.end.x" :y2="edge.end.y" stroke="#888" stroke-width="2" marker-end="url(#arrowhead)" />

        <line v-if="connectionStart" :x1="connectionStart.x" :y1="connectionStart.y" :x2="mouse.x" :y2="mouse.y"
          stroke="#aaa" stroke-dasharray="5,5" />
      </svg>

      <!-- ETL nodes -->
      <div v-for="(node, index) in nodes" :key="node.id" class="draggable" :data-id="node.id"
        :style="{ transform: `translate(${node.x}px, ${node.y}px)` }">
        <ETLNodeWrapper :ref="(el: any) => handleSetNodeRef(el, index)" :type="node.type" :component-props="node"
          @register-connectors="(id: number, refs: ConnectorRefs) => connectorMap.set(id, refs)"
          @dragstart="startNodeDrag(index, $event)" @start-connection="handleStartConnection"
          @finish-connection="handleFinishConnection" @update-node-payload="handleNodePayload" />
      </div>
    </div>

    <ContextMenu v-if="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" @add-node="handleAddNode" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect, watch, type Ref, type ComponentPublicInstance, type Component, toRaw } from 'vue'
import ContextMenu from './ContextMenu.vue'
import ETLNodeWrapper from './ETLNodeWrapper.vue'
import { useCanvasControls } from '../shared/scripts/useCanvasControls'
import { addNode } from '../shared/scripts/utils/addNode'
import type { NodeData, ContextMenuData } from '../shared/types/canva'
import { provide } from 'vue'
import { filterSelectedFields } from '../shared/scripts/utils/treeFilter'
import { type ETLComponent, CreateConfig } from '../shared/scripts/createConfig'
import type { PipelineConfig } from '../shared/scripts/PipelineConfig'

const viewContainer = ref<HTMLElement | null>(null)
const nodes = ref<NodeData[]>([])
const edges = ref<Edge[]>([])
const mouse = reactive({ x: 0, y: 0 })
const connectionStart = ref<{ nodeId: number; x: number; y: number } | null>(null)
const containerSize = reactive({ width: 0, height: 0 })

provide('nodes', nodes)
provide('edges', edges)

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

const connectorMap = new Map<number, ConnectorRefs>()

const nodeComponents: Ref<(InstanceType<typeof ETLNodeWrapper> | null)[]> = ref([]);
const nodeRefs: Ref<(HTMLElement | null)[]> = ref([])

// Update handleSetNodeRef to accept the el parameter
function handleSetNodeRef(el: HTMLElement | ComponentPublicInstance | null, index: number) {
  // Store the Vue component instance
  if (el) {
    if (el instanceof HTMLElement) {
      nodeRefs.value[index] = el;
    } else {
      // If it's a component instance, we need to access its $el property
      const compEl = (el as any).$el;
      nodeRefs.value[index] = compEl instanceof HTMLElement ? compEl : null;
    }

    // Store the component instance separately
    nodeComponents.value[index] = el as any;
  } else {
    nodeRefs.value[index] = null;
    nodeComponents.value[index] = null;
  }
}

const exportPipeline = (): PipelineConfig | null => {
  try {
    const configBuilder = new CreateConfig(nodes.value, nodeComponents.value);
    const config = configBuilder.build();

    return config as PipelineConfig;
  } catch (err) {
    console.error('Failed to build config:', err);
    return null;
  }
}
import { type ExtractConfig } from './Extract/Scripts/extractConfig'
import { nextTick } from 'vue';
import type { TransformConfig } from './Transform/transformConfig'
import type { LoadConfig } from './Load/loadConfig'

async function loadFromPipelineConfig(config: PipelineConfig) {
  const extractConfig = config.ExtractConfig as ExtractConfig;
  const transformConfig = config.TransformConfig as TransformConfig;
  const loadConfig = config.LoadConfig as LoadConfig;

  if (!contextMenu.worldX || !contextMenu.worldY) {
    contextMenu.worldX = 100;
    contextMenu.worldY = 100;
  }

  async function addConfiguredNode(nodeType: string, nodeConfig: any) {
    await addNode(nodeType, contextMenu, nodes, nodeRefs);
    await nextTick();

    const nodeIndex = nodes.value.length - 1;
    const node = nodes.value[nodeIndex];
    const nodeComponent = nodeComponents.value[nodeIndex];

    if (nodeComponent) {
      await nodeComponent.setConfig(nodeConfig);
    }

    return {
      node,
      element: nodeRefs.value[nodeIndex],
      index: nodeIndex
    };
  }

  function positionNextNode(fromNode: any, spacing = 100) {
    const nodeWidth = fromNode.element?.offsetWidth || 200;
    contextMenu.worldX = fromNode.node.x + nodeWidth + spacing;
    contextMenu.worldY = fromNode.node.y;
  }

  function connectNodes(fromNode: any, toNode: any) {
    handleStartConnection(fromNode.node.id);
    handleFinishConnection(toNode.node.id);
  }

  const sourceInfo = extractConfig.SourceInfo;
  const extractNodeRef = await addConfiguredNode(sourceInfo.$type, extractConfig);

  positionNextNode(extractNodeRef);
  const transformNodeRef = await addConfiguredNode('rules', transformConfig);

  connectNodes(extractNodeRef, transformNodeRef);

  positionNextNode(transformNodeRef);
  const loadNodeRef = await addConfiguredNode('database', loadConfig);

  connectNodes(transformNodeRef, loadNodeRef);

  contextMenu.visible = false;
  updateContainerBounds();
}
defineExpose({
  exportPipeline,
  loadFromPipelineConfig
})

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

  for (const node of nodes.value) {
    const ref = nodeRefs.value.find(n => n?.dataset.id === String(node.id))
    const width = ref?.offsetWidth || 100
    const height = ref?.offsetHeight || 50

    maxX = Math.max(maxX, node.x + width)
    maxY = Math.max(maxY, node.y + height)
  }

  for (const edge of edges.value) {
    maxX = Math.max(maxX, edge.start.x, edge.end.x)
    maxY = Math.max(maxY, edge.start.y, edge.end.y)
  }

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

  // Add the connection
  edges.value.push({
    fromNodeId: connectionStart.value.nodeId,
    toNodeId: nodeId,
    start: { x: connectionStart.value.x, y: connectionStart.value.y },
    end: { x: endX, y: endY }
  })

  const fromNode = nodes.value.find(n => n.id === connectionStart.value!.nodeId)
  const toNode = nodes.value.find(n => n.id === nodeId)

  if (fromNode?.group === 'extract' && toNode?.group === 'transform') {
    if (fromNode.fieldTree) {

      const rawTree = toRaw(fromNode.fieldTree)
      const filteredTree = filterSelectedFields(rawTree)
      toNode.fieldTree = filteredTree
    }
  }
  if (fromNode?.group === 'transform' && toNode?.group === 'load') {
    if (fromNode.fieldTree) {
      const rawTree = toRaw(fromNode.fieldTree)
      const filteredTree = filterSelectedFields(rawTree)
      toNode.fieldTree = filteredTree
    }
  }

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

function handleNodePayload({ fromId, payload }: { fromId: number; payload: any }) {
  console.log("Payload recieved in canvas")

  const fromNode = nodes.value.find(n => n.id === fromId)
  if (!fromNode || !payload) return

  const filteredPayload: Record<string, any> = {}

  // Type guard for fieldTree
  if ('fieldTree' in payload && Array.isArray(payload.fieldTree)) {
    const rawTree = toRaw(payload.fieldTree)
    filteredPayload.fieldTree = filterSelectedFields(rawTree)
  }

  // Propagate to all connected nodes
  for (const edge of edges.value) {
    if (edge.fromNodeId !== fromId) continue

    const toNode = nodes.value.find(n => n.id === edge.toNodeId)
    if (toNode) {
      Object.assign(toNode, filteredPayload)
    }
  }
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

watch(scale, () => {
  updateContainerBounds()
})
watchEffect(() => {
  for (const fromNode of nodes.value) {
    if (!fromNode.fieldTree) continue

    const filteredTree = filterSelectedFields(toRaw(fromNode.fieldTree))

    for (const edge of edges.value) {
      if (edge.fromNodeId !== fromNode.id) continue

      const toNode = nodes.value.find(n => n.id === edge.toNodeId)
      if (!toNode) continue

      if (
        fromNode.group === 'transform' &&
        toNode.group === 'load'
      ) {
        toNode.fieldTree = filteredTree
      }

    }
  }
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