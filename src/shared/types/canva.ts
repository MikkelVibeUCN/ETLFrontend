export interface NodeData {
    x: number
    y: number
    type: string
    name: string
  }
  
  export interface ContextMenuData {
    visible: boolean
    x: number
    y: number
    worldX: number
    worldY: number
  }
  
  export interface PanState {
    isPanning: boolean
    isDragging: boolean
    draggedNodeIndex: number | null
    startX: number
    startY: number
    moved: boolean
    cursor: 'default' | 'grabbing'
  }
  