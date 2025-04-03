<template>
    <div class="extract-container">
      <component
  :is="currentComponent"
  v-bind="componentProps"
  @update-payload="onPayload"
/>


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
  }
  }
}
</script>

<style scoped>

.extract-container {
  padding: 1rem;
}
</style>