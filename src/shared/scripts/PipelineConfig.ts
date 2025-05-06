import type { ExtractConfig } from "../../components/Extract/Scripts/extractConfig";
import type { TransformConfig } from "../../components/Transform/transformConfig";
import type { LoadConfig } from "../../components/Load/loadConfig";

export interface PipelineConfig {
  Id: string;
  Name: string,
  Description: string;
  ExtractConfig: ExtractConfig;
  TransformConfig: TransformConfig;
  LoadConfig: LoadConfig;
}

export function createBlankConfig(): PipelineConfig {
  return {
    Id: "",
    Name: "",
    Description: "",
    ExtractConfig: {
      SourceInfo: {
        $type: "",
        Headers: {},
        Url: "",
      },
      Fields: [],
      Filters: [],
    },
    TransformConfig: {
      Filters: [],
      Mappings: [],
    },
    LoadConfig: {
      Tables: [],
      TargetInfo: {
        $type: "",
        ConnectionString: "",
        LoadMode: "",
      },
    },
  }
}
