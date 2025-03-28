<template>
    <div class="main-view" :class="{ grabbing: state.cursor === 'grabbing' }" @mousedown.right.prevent="handleMouseDown"
        @mouseup.prevent="handleMouseUp" @mousemove="handleMouseMove" @contextmenu.prevent @wheel.prevent="onWheel"
        ref="viewContainer">

        <div class="pan-zoom-container" :style="transformStyle">
            <div v-for="(node, index) in nodes" :key="index" class="draggable" :ref="el => setNodeRef(index, el)"





                :style="{ transform: `translate(${node.x}px, ${node.y}px)` }">
                <Extract :type="node.type" :component-props="node" @dragstart="startNodeDrag(index, $event)" />
            </div>
        </div>

        <ContextMenu v-if="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" @add-node="handleAddNode" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, type Ref, type Component } from 'vue'
import ContextMenu from './ContextMenu.vue'
import Extract from './Extract/Extract.vue'
import { useCanvasControls } from './Extract/Scripts/useCanvasControls'
import { addNode } from '../shared/scripts/utils/addNode'
import type { NodeData, ContextMenuData } from '../shared/types/canva'

// Refs and reactive state
const viewContainer = ref<HTMLElement | null>(null)
const nodes = ref<NodeData[]>([
  { x: 100, y: 100, type: 'API', name: 'API' }
])

const nodeRefs: Ref<(HTMLElement | null)[]> = ref([])

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

// Pan/Zoom/Drag logic
const {
  transformStyle,
  state,
  startNodeDrag,
  handleMouseDown,
  handleMouseUp,
  handleMouseMove,
  onWheel
} = useCanvasControls(viewContainer, nodes, nodeRefs, contextMenu)

// Hook into emitted context menu action
function handleAddNode(type: string, name: string) {
  addNode(type, name, contextMenu, nodes, nodeRefs)
}

// Hide context menu on click outside
onMounted(() => {
  window.addEventListener('click', (e) => {
    const menu = document.querySelector('.context-menu')
    if (!menu || !menu.contains(e.target as Node)) {
      contextMenu.visible = false
    }
  })
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
</style>