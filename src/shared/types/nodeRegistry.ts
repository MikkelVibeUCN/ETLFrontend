export type NodeGroup = 'extract' | 'transform' | 'load'

export interface NodeDefinition {
  version: string  // e.g., "API", "Rules"
  title: string
  icon: string
  group: NodeGroup
  enabled: boolean
}

// Flat list of node definitions (easier to use)
export const nodeDefinitions: NodeDefinition[] = [
  { version: 'api', title: 'Extract from API', icon: 'globe', group: 'extract', enabled: true },
  { version: 'file', title: 'Extract from File', icon: 'file-alt', group: 'extract', enabled: false },
  { version: 'rules', title: 'Transform Rules', icon: 'cog', group: 'transform', enabled: true },
  { version: 'database', title: 'Load to Database', icon: 'database', group: 'load', enabled: true },
  { version: 'file', title: 'Load to File', icon: 'file-alt', group: 'load', enabled: false },
]

// Lookup by version
export function findNodeDefinition(version: string): NodeDefinition | undefined {
  return nodeDefinitions.find(def => def.version === version)
}

// Grouped for menus
export const nodeRegistry: Record<NodeGroup, NodeDefinition[]> = {
  extract: nodeDefinitions.filter(n => n.group === 'extract'),
  transform: nodeDefinitions.filter(n => n.group === 'transform'),
  load: nodeDefinitions.filter(n => n.group === 'load'),
}
