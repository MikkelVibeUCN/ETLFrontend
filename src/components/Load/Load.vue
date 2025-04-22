<template>
  <div class="load-container">
    <component ref="child" :is="currentComponent" v-bind="resolvedProps" />
  </div>
</template>

<script>
import Database from './Database/Database.vue'


export default {
  name: 'load',
  components: {
    Database
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
        case 'database':
          return Database
        default:
          return null
      }
    },
    resolvedProps() {
      switch (this.type) {
        case 'database':
          return {
            fieldTree: this.componentProps.fieldTree || []
          }
        default:
          return {}
      }
    }
  },
  methods: {
    getConfig() {
      if (this.$refs.child && typeof this.$refs.child.getConfig === 'function') {
        return this.$refs.child.getConfig()
      }
      return {}
    },
    setConfig(config) {
      if (this.$refs.child && typeof this.$refs.child.setConfig === 'function') {
        this.$refs.child.setConfig(config)
      }
    }
  }
}
</script>


<style scoped>
.load-container {
  min-width: 500px;
  width: auto;
}
</style>