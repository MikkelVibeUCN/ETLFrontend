  <template>
    <div class="node-wrapper">
      <div v-if="nodeGroup === 'extract' || nodeGroup === 'transform'" class="connector-out" ref="connectorOut"
        @mousedown.stop="$emit('start-connection', componentProps.id)" />

      <div v-if="nodeGroup === 'transform' || nodeGroup === 'load'" class="connector-in" ref="connectorIn"
        @mouseup.stop="$emit('finish-connection', componentProps.id)" />

      <div class="node-header" @mousedown.left.stop="$emit('dragstart', $event)">
        <font-awesome-icon :icon="icon" class="icon" />
        <span class="title">{{ title }}</span>
        <button class="dots-btn" @click="handleDotsClick">•••</button>
      </div>

      <div class="node-container">
        <component :is="component" :type="type" :componentProps="componentProps" @update-payload="handlePayload"
          ref="innerComponentRef" />

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
  import Load from './Load/Load.vue'

  export default {
    name: 'ETLNodeWrapper',
    components: {
      FontAwesomeIcon,
      Extract,
      Transform,
      Load
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
        if (['restapi', 'file'].includes(this.type)) return 'extract'
        if (['rules'].includes(this.type)) return 'transform'
        if (['database'].includes(this.type)) return 'load'
        return 'unknown'
      },
      metadata() {
        const map = {
          extract: {
            component: 'Extract',
            titles: {
              restapi: 'Extract from API',
              file: 'Extract from File'
            },
            icons: {
              restapi: 'globe',
              file: 'file-alt'
            }
          },
          transform: {
            component: 'Transform',
            titles: {
              rules: 'Transform Rules'
            },
            icons: {
              rules: 'cog'
            }
          },
          load: {
            component: 'Load',
            titles: {
              database: 'Load to Database'
            },
            icons: {
              database: 'database'
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
      },
      handlePayload(payload) {
        console.log("Payload recieved in Wrapper")
        Object.assign(this.componentProps, payload)

        this.$emit('update-node-payload', {
          fromId: this.componentProps.id,
          payload
        })
      },
      getConfig() {
        return this.$refs.innerComponentRef?.getConfig?.()
      },
      setConfig(config) {
        this.$refs.innerComponentRef?.setConfig?.(config)
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
    display: inline-flex;
    flex-direction: column;
    font-family: sans-serif;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    width: auto;
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
    width: 100%;
    box-sizing: border-box;
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