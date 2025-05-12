import type { NodeDefinition } from "../../shared/types/nodeRegistry";

export function getTranformComponent(type: string) {
  switch (type) {
    case "rules":
      return "Rules";
    default:
      return null;
  }
}

export const transformNodeDefinitions: NodeDefinition[] = [
  {
    version: "rules",
    title: "Transform Rules",
    icon: "cog",
    group: "transform",
    enabled: true,
  },
];
