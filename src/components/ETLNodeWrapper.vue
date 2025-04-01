<template>
  <div class="node-wrapper">
    <div class="connector-out" ref="connectorOut" @mousedown.stop="$emit('start-connection', componentProps.id)" />
    <div class="connector-in" ref="connectorIn" @mouseup.stop="$emit('finish-connection', componentProps.id)" />


    <div class="node-header" @mousedown.left.stop="$emit('dragstart', $event)">
      <font-awesome-icon :icon="icon" class="icon" />
      <span class="title">{{ title }}</span>
      <button class="dots-btn" @click="handleDotsClick">•••</button>
    </div>

    <div class="node-container">
      <component :is="component" :type="type" :componentProps="componentProps" />
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGlobe, faCog, faDatabase, faFileAlt } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(faGlobe, faCog, faDatabase, faFileAlt)

// Component wrappers
import Extract from './Extract/Extract.vue'
import Transform from './Transform/Transform.vue'

export default {
  name: 'ETLNodeWrapper',
  components: {
    FontAwesomeIcon,
    Extract,
    Transform
  },
  props: {
    type: {
      type: String,
      required: true
    },
    componentProps: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    nodeGroup() {
      if (['API', 'File'].includes(this.type)) return 'extract'
      if (['Rules'].includes(this.type)) return 'transform'
      return 'unknown'
    },
    metadata() {
      const map = {
        extract: {
          component: 'Extract',
          titles: {
            API: 'Extract from API',
            File: 'Extract from File'
          },
          icons: {
            API: 'globe',
            File: 'file-alt'
          }
        },
        transform: {
          component: 'Transform',
          titles: {
            Rules: 'Transform Rules'
          },
          icons: {
            Rules: 'cog'
          }
        }
      }

      const group = this.nodeGroup
      const fallback = { component: null, title: 'Unknown', icon: 'file-alt' }

      if (!map[group]) return fallback

      return {
        component: map[group].component,
        title: map[group].titles[this.type] || fallback.title,
        icon: map[group].icons[this.type] || fallback.icon
      }
    },
    component() {
      return this.metadata.component
    },
    title() {
      return this.metadata.title
    },
    icon() {
      return this.metadata.icon
    }
  },
  methods: {
    handleDotsClick() {
      this.$emit('options-click', this.componentProps.id)
    }
  },
  mounted() {
    this.$emit('register-connectors', this.componentProps.id, {
      out: this.$refs.connectorOut,
      in: this.$refs.connectorIn
    })
  }
}
</script>

<style scoped>
.node-wrapper {
  border: 2px solid #444;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  width: fit-content;
  max-width: 100%;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1a1a1a;
  padding: 0.5rem 0.75rem;
  font-weight: bold;
  color: white;
}

.icon {
  margin-right: 0.5rem;
}

.title {
  flex-grow: 1;
  color: white;
  font-size: 0.95rem;
}

.dots-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
}

.dots-btn:hover {
  opacity: 0.8;
}

.node-container {
  padding: 1rem;
}

.connector-out,
.connector-in {
  width: 12px;
  height: 12px;
  background-color: #888;
  border-radius: 50%;
  position: absolute;
  cursor: pointer;
}

.connector-out {
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
}

.connector-in {
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
}
</style>