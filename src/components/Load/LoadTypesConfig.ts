import type { NodeModule } from '../../shared/types/nodeModule'
import Database from './Database/Database.vue'
const group = 'load'

export const loadNodeModule: NodeModule = {
  getComponent: (type: string) => {
    switch (type) {
      case 'database':
        return Database
      default:
        return null
    }
  },
  nodeDefinitions: [
    {
      version: 'database',
      title: 'Load to Database',
      icon: 'database',
      group,
      enabled: true,
    },
    {
      version: 'file',
      title: 'Load to File',
      icon: 'file-alt',
      group,
      enabled: false,
    },
  ],
}
