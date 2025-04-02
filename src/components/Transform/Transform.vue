<template>
  <div class="transform-container">
    <template v-if="isEmpty" class="empty-state">
      <DefaultContent />
    </template>
    <template v-else>
      <component
        :is="currentComponent"
        v-bind="resolvedProps"
        @update="onUpdate"
      />
    </template>
  </div>
</template>

<script>
import DefaultContent from './DefaultContent.vue'
import Rules from './Rules/Vue/Rules.vue'

export default {
  name: 'Transform',
  components: {
    Rules,
    DefaultContent,
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
        case 'Rules':
          return Rules
        default:
          return null
      }
    },
    resolvedProps() {
      switch (this.type) {
        case 'Rules':
          return {
            nodes: this.componentProps.fieldTree || [],
          }
        default:
          return {}
      }
    },
    isEmpty() {
      return (
        this.type === 'Rules' &&
        (!this.componentProps.fieldTree ||
         this.componentProps.fieldTree.length === 0)
      )
    }
  },
  methods: {
    onUpdate(newRules) {
      this.componentProps.ruleTree = newRules
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
  width: auto;
}
</style>
