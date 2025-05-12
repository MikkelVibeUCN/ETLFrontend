import type { NodeDefinition } from "../../shared/types/nodeRegistry";

export function getLoadComponent(type: string) {
  switch (type) {
    case "database":
      return "Database";
    default:
      return null;
  }
}

export const loadNodeDefinitions: NodeDefinition[] = [
  {
    version: "database",
    title: "Load to Database",
    icon: "database",
    group: "load",
    enabled: true,
  },
  {
    version: "file",
    title: "Load to File",
    icon: "file-alt",
    group: "load",
    enabled: false,
  },
];
