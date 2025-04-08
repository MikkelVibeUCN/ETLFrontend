import type { ExtractConfig } from '../../components/Extract/Scripts/extractConfig'
import type { TransformConfig } from '../../components/Transform/transformConfig'
import type { LoadConfig } from '../../components/Load/loadConfig'

export interface PipelineConfig {
  Id?: string;
  SourceInfo: {
    $type: string;
    Url: string;
    Headers: Record<string, string>;
  };
  ExtractConfig: Omit<ExtractConfig, 'SourceInfo'>
  TransformConfig: TransformConfig;
  LoadTargetConfig: LoadConfig;
}