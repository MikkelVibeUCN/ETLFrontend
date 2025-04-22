<template>
  <div class="transform-container">
    <template v-if="isEmpty">
      <DefaultContentTransform />
    </template>
    <template v-else>
      <component ref="child" :is="currentComponent" v-bind="resolvedProps" @update="onUpdate" />
    </template>
  </div>
</template>

<script>
import Rules from './Rules/Vue/Rules.vue'
import DefaultContentTransform from './DefaultContentTransform.vue'

export default {
  name: 'Transform',
  components: {
    Rules,
    DefaultContentTransform
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
    currentComponent() {
      switch (this.type) {
        case 'rules':
          return Rules
        default:
          return null
      }
    },
    resolvedProps() {
      if (this.type === 'rules') {
        return {
          nodes: this.componentProps.fieldTree || []
        }
      }
      return {}
    },
    isEmpty() {
      return (
        this.type === 'rules' &&
        (!this.componentProps.fieldTree || this.componentProps.fieldTree.length === 0)
      )
    },

  },
  methods: {
    onUpdate(updatedTree) {
      // Update the fieldTree in the current node
      this.componentProps.fieldTree = updatedTree

      // Emit update to downstream nodes via payload
      this.$emit('update-payload', {
        fieldTree: updatedTree
      })
    },
    getConfig() {
      if (this.$refs.child && typeof this.$refs.child.getConfig === 'function') {
        return this.$refs.child.getConfig()
      }
      return {}
    },
    setConfig(config) {
      console.log('setConfig called', config);

      this.$nextTick(() => {
        const checkChildExistence = () => {
          if (this.$refs.child && typeof this.$refs.child.setConfig === 'function') {
            console.log('Calling setConfig on child component');
            this.$refs.child.setConfig(config);
          } else {
            console.log('Child component not ready, retrying...');
            // Retry after another nextTick to ensure the child is properly mounted
            setTimeout(() => {
              this.$nextTick(checkChildExistence);
            }, 0); // Retry with minimal delay
          }
        };

        checkChildExistence(); // Initial check
      });
    }
  }
}
</script>

<style scoped>
.transform-container {
  min-width: 500px;
  width: auto;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  border: 2px dashed #444;
  border-radius: 10px;
  background-color: #1a1a1a;
  color: #ccc;
  margin: 2rem auto;
}
</style>
