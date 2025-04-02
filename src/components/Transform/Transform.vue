<template>
  <div class="transform-container">
        <component
      :is="currentComponent"
      v-bind="resolvedProps"
      @update="onUpdate"
    />

  </div>
</template>

<script>
import Rules from './Rules/Vue/Rules.vue'

export default {
  name: 'Transform',
  components: {
    Rules
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
  }
  },
  
  methods: {
    onUpdate(newRules) {
      this.componentProps.ruleTree = newRules
    }
  },
  
}
</script>


  <style scoped>
  .transform-container {
    min-width: 500px;
    width: auto;
  }
  </style>
