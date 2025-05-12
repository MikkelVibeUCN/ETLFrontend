import type { NodeDefinition } from "../../../shared/types/nodeRegistry";

export function getExtractComponent(type: string) {
  switch (type) {
    case "restapi":
      return "APIContent";
    default:
      return null;
  }
}

export const extractNodeDefinitions: NodeDefinition[] = [
  {
    version: "restapi",
    title: "Extract from API",
    icon: "globe",
    group: "extract",
    enabled: true,
  },
  {
    version: "file",
    title: "Extract from File",
    icon: "file-alt",
    group: "extract",
    enabled: false,
  },
];
