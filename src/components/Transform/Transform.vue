<template>
  <div class="transform-container">
    <component :is="currentComponent" v-bind="componentProps" />
  </div>
</template>

<script>
import RulesContent from './Rules/Vue/Rules.vue'

export default {
  name: 'Transform',
  components: {
    RulesContent
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
          return 'Rules'
        default:
          return null
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
    padding: 1rem;
  }
  </style>
