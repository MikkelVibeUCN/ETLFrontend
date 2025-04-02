import type { NodeGroup } from './nodeRegistry'

export interface NodeData {
  id: number
  x: number
  y: number
  type: string         // e.g., "API"
  title: string        // from registry
  icon: string         // from registry
  group: NodeGroup     // added
  fieldTree?: FieldNode[]

}

interface FieldNode {
  name: string
  selected: boolean
  dataType: string;
  rule?: string
  children?: FieldNode[]
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
  