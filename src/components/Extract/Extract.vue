<template>
  <div class="extract-container">
    <component :is="currentComponent" v-bind="componentProps" @update-payload="onPayload" ref="child"/>
  </div>
</template>

<script>
import APIContent from './API/Vue/APIContent.vue'

export default {
  name: 'Extract',
  components: {
    APIContent,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    componentProps: {
      type: Object,
      default: () => ({}),
    }
  },
  computed: {
    currentComponent() {
      switch (this.type) {
        case 'API':
          return 'APIContent';
        default:
          return null;
      }
    }
  },
  methods: {
    onPayload(payload) {
      console.log('[Extract] Forwarding update-payload:', payload)
      this.$emit('update-payload', payload)
    },
    getConfig() {
      if (this.$refs.child && typeof this.$refs.child.getConfig === 'function') {
        return this.$refs.child.getConfig()
      }
      return {}
    }
  }
}
</script>

<style scoped>
.extract-container {
  padding: 1rem;
}
</style>