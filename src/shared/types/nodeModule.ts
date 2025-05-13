import type { NodeDefinition } from "./nodeRegistry";

export interface NodeModule {
  getComponent(type: string): any;
  nodeDefinitions: NodeDefinition[];
}