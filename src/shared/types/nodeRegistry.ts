import { extractNodeDefinitions } from "../../components/Extract/Scripts/ExtractTypesConfig"
import { loadNodeDefinitions } from "../../components/Load/LoadTypesConfig"
import { transformNodeDefinitions } from "../../components/Transform/TranformTypesConfig"

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
  ...extractNodeDefinitions,
  ...transformNodeDefinitions,
  ...loadNodeDefinitions,
];
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
