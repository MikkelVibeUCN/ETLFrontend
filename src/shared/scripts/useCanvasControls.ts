import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import { isOverlapping, getNodeRect } from './utils/geometry'
import type { NodeData, ContextMenuData, PanState } from '../types/canva'


export function useCanvasControls(
    viewContainer: Ref<HTMLElement | null>,
    nodes: Ref<NodeData[]>,
    nodeRefs: Ref<(HTMLElement | null)[]>,
    contextMenu: ContextMenuData
  ) {
    const scale = ref(1)
    const maxScale = 0.1
    const panOffset = reactive({ x: 0, y: 0 })
  
    const transformStyle: ComputedRef<Record<string, string>> = computed(() => ({
      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale.value})`
    }))
  
    const state = reactive<PanState>({
      isPanning: false,
      isDragging: false,
      draggedNodeIndex: null,
      startX: 0,
      startY: 0,
      moved: false,
      cursor: 'default'
    })
  function startNodeDrag(index: number, e: MouseEvent) {
    console.log("Dragging")
    state.isDragging = true
    state.draggedNodeIndex = index
    state.startX = e.clientX
    state.startY = e.clientY
    state.cursor = 'grabbing'
  }

  function handleMouseDown(e: MouseEvent) {
    contextMenu.visible = false
    state.startX = e.clientX
    state.startY = e.clientY
    state.moved = false

    if (e.button === 2) {
      state.isPanning = true
      state.cursor = 'grabbing'
    }
  }

  function handleMouseUp(e: MouseEvent) {
    if (e.button === 2 && !state.moved && viewContainer.value) {
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

  function handleMouseMove(e: MouseEvent) {
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
      const el = nodeRefs.value[state.draggedNodeIndex]
      const width = el?.offsetWidth || 0
      const height = el?.offsetHeight || 0

      const proposed = { x: node.x + dx, y: node.y + dy, width, height }
      const collision = nodes.value.some((n, i) => {
        if (i === state.draggedNodeIndex) return false
        const otherEl = nodeRefs.value[i]
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

  function onWheel(e: WheelEvent) {
    if (!viewContainer.value) return

    const rect = viewContainer.value.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.min(5, Math.max(maxScale, scale.value * zoomFactor))
    const worldX = (mouseX - panOffset.x) / scale.value
    const worldY = (mouseY - panOffset.y) / scale.value
    scale.value = newScale
    panOffset.x = mouseX - worldX * newScale
    panOffset.y = mouseY - worldY * newScale
  }

  return {
    scale,
    panOffset,
    transformStyle,
    state,
    startNodeDrag,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    onWheel
  }
}
