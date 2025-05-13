import Rules from './Rules/Vue/Rules.vue'
import type { NodeModule } from '../../shared/types/nodeModule'

const group = 'transform'

export const transformNodeModule: NodeModule = {
  getComponent: (type: string) => {
    switch (type) {
      case 'rules':
        return Rules
      default:
        return null
    }
  },
  nodeDefinitions: [
    {
      version: 'rules',
      title: 'Transform Rules',
      icon: 'cog',
      group,
      enabled: true,
    },
  ],
}
