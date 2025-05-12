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
import { getTranformComponent } from './TranformTypesConfig'

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
      return getTranformComponent(this.type);
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
        !this.componentProps.fieldTree || this.componentProps.fieldTree.length === 0
      )
    },

  },
  methods: {
    onUpdate(updatedTree) {
      // Only update the isSelected property of existing nodes
      const originalTree = this.componentProps.fieldTree || [];

      const updatedTreeMap = new Map(
        updatedTree.map(node => [node.id, node.isSelected])
      );

      const mergedTree = originalTree.map(node => {
        const isSelected = updatedTreeMap.has(node.id)
          ? updatedTreeMap.get(node.id)
          : node.isSelected;

        return {
          ...node,
          isSelected
        };
      });

      // Save the updated tree
      this.componentProps.fieldTree = mergedTree;

      // Emit only the updated isSelected state
      this.$emit('update-payload', {
        fieldTree: mergedTree
      });
    },

    getConfig() {
      if (this.$refs.child && typeof this.$refs.child.getConfig === 'function') {
        return this.$refs.child.getConfig()
      }
      return {}
    },
    setConfig(config) {
      console.log('setConfig called', config);

      let attempts = 0;
      const maxAttempts = 10;

      const checkChildExistence = () => {
        const child = this.$refs.child;
        if (child && typeof child.setConfig === 'function') {
          console.log('Calling setConfig on child component');
          child.setConfig(config);
        } else if (attempts < maxAttempts && this.currentComponent) {
          attempts++;
          console.log(`Child not ready, retrying (${attempts}/${maxAttempts})...`);
          setTimeout(() => {
            this.$nextTick(checkChildExistence);
          }, 300);
        } else {
          console.log('setConfig failed: component not ready or max attempts reached');
        }
      };
      this.$nextTick(checkChildExistence);
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
