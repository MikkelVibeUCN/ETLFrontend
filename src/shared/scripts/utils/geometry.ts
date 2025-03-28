export function isOverlapping(a: Rect, b: Rect): boolean {
    return !(a.x + a.width <= b.x ||
             a.x >= b.x + b.width ||
             a.y + a.height <= b.y ||
             a.y >= b.y + b.height)
  }
  
  export function getNodeRect(node: any, el: HTMLElement): Rect {
    const { offsetWidth: width, offsetHeight: height } = el
    return { x: node.x, y: node.y, width, height }
  }
  
  export interface Rect {
    x: number
    y: number
    width: number
    height: number
  }