<template>
    <div class="main-view" :class="{ grabbing: state.cursor === 'grabbing' }" @mousedown.prevent="handleMouseDown"
      @mouseup.prevent="handleMouseUp" @mousemove="handleMouseMove" @contextmenu.prevent @wheel.prevent="onWheel"
      ref="viewContainer">
      <div class="pan-zoom-container" :style="transformStyle">
        <div v-for="(node, index) in nodes" :key="index" class="draggable"
          :ref="el => nodeRefs[index] = el"
          :style="{ transform: `translate(${node.x}px, ${node.y}px)` }"
          @mousedown.left.prevent="startNodeDrag(index, $event)">
          <slot :node="node" />
        </div>
      </div>
  
      <ContextMenu v-if="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" @add-node="addNode" />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import ContextMenu from './ContextMenu.vue'
  
  const scale = ref(1)
  const panOffset = reactive({ x: 0, y: 0 })
  const viewContainer = ref(null)
  const nodeRefs = reactive({})
  
  const nodes = ref([
    { x: 100, y: 100, type: 'extract', name: 'API' }
  ])
  
  const transformStyle = computed(() => ({
    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale.value})`
  }))
  
  const state = reactive({
    isPanning: false,
    isDragging: false,
    draggedNodeIndex: null,
    startX: 0,
    startY: 0,
    moved: false,
    cursor: 'default'
  })
  
  const contextMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0
  })
  
  function isOverlapping(a, b) {
    return !(
      a.x + a.width <= b.x ||
      a.x >= b.x + b.width ||
      a.y + a.height <= b.y ||
      a.y >= b.y + b.height
    )
  }
  
  function getNodeRect(node, el) {
    const { offsetWidth: width, offsetHeight: height } = el
    return { x: node.x, y: node.y, width, height }
  }
  
  async function addNode(type, name) {
    if (type !== 'extract') return
  
    const dummy = document.createElement('div')
    dummy.style.position = 'absolute'
    dummy.style.visibility = 'hidden'
    dummy.className = 'draggable'
    dummy.innerHTML = `<div>${type}-${name}</div>`
    document.body.appendChild(dummy)
    await nextTick()
  
    const width = dummy.offsetWidth
    const height = dummy.offsetHeight
    dummy.remove()
  
    const padding = 10
    const step = 20
    const bounds = { minX: 0, minY: 0, maxX: 3000, maxY: 3000 } // reasonable canvas area
  
    let x = contextMenu.worldX
    let y = contextMenu.worldY
    let newNode = { x, y, type, name }
  
    let placed = false
    for (let offsetY = 0; offsetY < bounds.maxY; offsetY += step) {
      for (let offsetX = 0; offsetX < bounds.maxX; offsetX += step) {
        const candidate = {
          x: x + offsetX,
          y: y + offsetY,
          width,
          height
        }
        const overlaps = nodes.value.some((n, i) => {
          const el = nodeRefs[i]
          if (!el) return false
          const other = getNodeRect(n, el)
          return isOverlapping(candidate, other)
        })
        if (!overlaps) {
          newNode.x = candidate.x
          newNode.y = candidate.y
          placed = true
          break
        }
      }
      if (placed) break
    }
  
    if (!placed) {
      console.warn('No available space to place new node.')
      return
    }
  
    nodes.value.push(newNode)
    contextMenu.visible = false
  }
  
  function handleMouseDown(e) {
    contextMenu.visible = false
    state.startX = e.clientX
    state.startY = e.clientY
    state.moved = false
    if (e.button === 2) {
      state.isPanning = true
      state.cursor = 'grabbing'
    }
  }
  
  function handleMouseUp(e) {
    if (e.button === 2 && !state.moved) {
      const rect = viewContainer.value.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
  
      contextMenu.x = screenX
      contextMenu.y = screenY
      contextMenu.worldX = (screenX - panOffset.x) / scale.value
      contextMenu.worldY = (screenY - panOffset.y) / scale.value
      contextMenu.visible = true
    }
    state.isPanning = false
    state.isDragging = false
    state.draggedNodeIndex = null
    state.cursor = 'default'
  }
  
  function handleMouseMove(e) {
    const movedEnough = Math.abs(e.clientX - state.startX) > 2 || Math.abs(e.clientY - state.startY) > 2
    if (movedEnough) state.moved = true
  
    if (state.isPanning) {
      panOffset.x += e.clientX - state.startX
      panOffset.y += e.clientY - state.startY
      state.startX = e.clientX
      state.startY = e.clientY
      state.cursor = 'grabbing'
    }
  
    if (state.isDragging && state.draggedNodeIndex !== null) {
      const dx = (e.clientX - state.startX) / scale.value
      const dy = (e.clientY - state.startY) / scale.value
      const node = nodes.value[state.draggedNodeIndex]
      const el = nodeRefs[state.draggedNodeIndex]
      const width = el?.offsetWidth || 0
      const height = el?.offsetHeight || 0
  
      const proposed = { x: node.x + dx, y: node.y + dy, width, height }
      const collision = nodes.value.some((n, i) => {
        if (i === state.draggedNodeIndex) return false
        const otherEl = nodeRefs[i]
        if (!otherEl) return false
        const other = getNodeRect(n, otherEl)
        return isOverlapping(proposed, other)
      })
  
      if (!collision) {
        node.x += dx
        node.y += dy
        state.startX = e.clientX
        state.startY = e.clientY
        state.cursor = 'grabbing'
      }
    }
  }
  
  function startNodeDrag(index, e) {
    state.isDragging = true
    state.draggedNodeIndex = index
    state.startX = e.clientX
    state.startY = e.clientY
    state.cursor = 'grabbing'
  }
  
  function onWheel(e) {
    const rect = viewContainer.value.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.min(5, Math.max(0.5, scale.value * zoomFactor))
    const worldX = (mouseX - panOffset.x) / scale.value
    const worldY = (mouseY - panOffset.y) / scale.value
    scale.value = newScale
    panOffset.x = mouseX - worldX * newScale
    panOffset.y = mouseY - worldY * newScale
  }
  
  onMounted(() => {
    window.addEventListener('click', (e) => {
      const menu = document.querySelector('.context-menu')
      if (!menu || !menu.contains(e.target)) {
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
    cursor: move;
    will-change: transform;
  }
  </style>