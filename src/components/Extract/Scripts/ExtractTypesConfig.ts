import type { NodeModule } from "../../../shared/types/nodeModule";
import APIContent from "../API/Vue/APIContent.vue";

const group = "extract";

export const extractNodeModule: NodeModule = {
  getComponent: (type: string) => {
    switch (type) {
      case "restapi":
        return APIContent;
      default:
        return null;
    }
  },
  nodeDefinitions: [
    {
      version: "restapi",
      title: "Extract from API",
      icon: "globe",
      group,
      enabled: true,
    },
    {
      version: "file",
      title: "Extract from File",
      icon: "file-alt",
      group,
      enabled: false,
    },
  ],
};
