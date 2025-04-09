import type { ExtractConfig } from '../../components/Extract/Scripts/extractConfig'
import type { TransformConfig } from '../../components/Transform/transformConfig'
import type { LoadConfig } from '../../components/Load/loadConfig'

export interface PipelineConfig {
  Id?: string;
  ExtractConfig: ExtractConfig,
  TransformConfig: TransformConfig;
  LoadTargetConfig: LoadConfig;
}