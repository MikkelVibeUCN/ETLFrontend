// src/shared/scripts/utils/CreateConfig.ts

import type { NodeData } from "../types/canva"
import { type Component } from "vue"
import type { ExtractConfig } from "../../components/Extract/Scripts/extractConfig"
import type { TransformConfig } from "../../components/Transform/transformConfig"
import type { LoadConfig } from "../../components/Load/loadConfig"
import type { PipelineConfig } from "./PipelineConfig"

export interface ETLComponent {
  getConfig: () => any
}

export class CreateConfig {
  private nodes: NodeData[]
  private components: (Component | null)[]

  constructor(nodes: NodeData[], components: (Component | null)[]) {
    this.nodes = nodes
    this.components = components
  }

  private isETLComponent(obj: any): obj is ETLComponent {
    return obj && typeof obj.getConfig === 'function'
  }

  build(pipelineId = '') {
    let extractConfig: ExtractConfig | null = null
    let transformConfig: TransformConfig | null = null
    let loadConfig: LoadConfig | null = null

    // Iterate over the nodes and components
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      const component = this.components[i]

      if (!this.isETLComponent(component)) continue

      const config = component.getConfig()

      // Populate the correct config object based on the node group
      switch (node.group) {
        case 'extract':
          extractConfig = {
            SourceInfo: config.SourceInfo,  // Extract the SourceInfo here
            Fields: config.Fields || [],
            Filters: config.Filters || []
          }
          break

        case 'transform':
          transformConfig = {
            Mappings: config.Mappings || [],
            Filters: config.Filters || []
          }
          break
        case 'load':
          loadConfig = config
          break
      }
    }

    // Throw an error if any part of the pipeline configuration is missing
    if (!extractConfig || !transformConfig || !loadConfig) {
      throw new Error('Missing part of the pipeline config (extract, transform, or load)')
    }

    // Return the complete pipeline configuration
    return {
      Id: pipelineId,
      ExtractConfig: extractConfig,
      TransformConfig: transformConfig,
      LoadConfig: loadConfig
    } as PipelineConfig
  }
}