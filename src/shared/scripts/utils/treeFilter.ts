import { type FieldNode } from "../jsonTreeBuilder"



export function filterSelectedFields(tree: FieldNode[]): FieldNode[] {
  return tree
    .map(node => {
      const filteredChildren = node.children ? filterSelectedFields(node.children) : []

      // Only include node if selected or it has any selected children
      if (node.selected || filteredChildren.length > 0) {
        const filteredNode: FieldNode = {
          name: node.name,
          selected: node.selected,
          dataType: node.dataType,
          children: filteredChildren.length ? filteredChildren : undefined,
        }

        // ✅ Include rules + ruleValues only if selected
        if (node.selected) {
          filteredNode.rules = node.rules ? [...node.rules] : []
          filteredNode.ruleValues = node.ruleValues ? { ...node.ruleValues } : {}
        }

        return filteredNode
      }

      return null
    })
    .filter(Boolean) as FieldNode[]
}
