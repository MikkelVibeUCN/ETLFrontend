// src/shared/scripts/utils/CreateConfig.ts

import type { NodeData } from "../types/canva"
import { type Component } from "vue"

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
    let sourceInfo: any = null
    let extractConfig: any = null
    let transformConfig: any = null
    let loadTargetConfig: any = null

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      const component = this.components[i]

      if (!this.isETLComponent(component)) continue

      const config = component.getConfig()

      switch (node.group) {
        case 'extract':
          extractConfig = {
            Fields: config.Fields || [],
            Filters: config.Filters || []
          }
          sourceInfo = config.SourceInfo
          break

        case 'transform':
          transformConfig = {
            Mappings: config.Mappings || [],
            Filters: config.Filters || []
          }
          break

        case 'load':
          loadTargetConfig = config.LoadTargetConfig
          break
      }
    }

    if (!sourceInfo || !extractConfig || !transformConfig || !loadTargetConfig) {
      throw new Error('Missing part of the pipeline config (extract, transform, or load)')
    }

    return {
      Id: pipelineId,
      SourceInfo: sourceInfo,
      ExtractConfig: extractConfig,
      TransformConfig: transformConfig,
      LoadTargetConfig: loadTargetConfig
    }
  }
}
