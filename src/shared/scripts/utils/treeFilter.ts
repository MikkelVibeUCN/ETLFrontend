import { type FieldNode } from "../jsonTreeBuilder"

export function filterSelectedFields(tree: FieldNode[]): FieldNode[] {
    return tree
      .map(node => {
        // Recursively filter children (if any)
        const filteredChildren = node.children ? filterSelectedFields(node.children) : []
  
        // Include node if selected or it has any selected children
        if (node.selected || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : undefined
          }
        }
  
        // Otherwise, exclude it
        return null
      })
      .filter(Boolean) as FieldNode[]
  }
  