import { extractNodeModule } from "../../components/Extract/Scripts/ExtractTypesConfig"
import { transformNodeModule } from "../../components/Transform/TranformTypesConfig"
import { loadNodeModule } from "../../components/Load/LoadTypesConfig"

export type NodeGroup = 'extract' | 'transform' | 'load'

export interface NodeDefinition {
  version: string  // e.g., "API", "Rules"
  title: string
  icon: string
  group: NodeGroup
  enabled: boolean
}

export const nodeDefinitions: NodeDefinition[] = [
  ...extractNodeModule.nodeDefinitions,
  ...transformNodeModule.nodeDefinitions,
  ...loadNodeModule.nodeDefinitions,
];
export function findNodeDefinition(version: string): NodeDefinition | undefined {
  return nodeDefinitions.find(def => def.version === version)
}

export const nodeRegistry: Record<NodeGroup, NodeDefinition[]> = {
  extract: extractNodeModule.nodeDefinitions,
  transform: transformNodeModule.nodeDefinitions,
  load: loadNodeModule.nodeDefinitions,
}