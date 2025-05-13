<template>
  <div class="extract-container">
    <component :is="currentComponent" v-bind="componentProps" @update-payload="onPayload" @component-ready="onComponentReady" ref="child" :key="type" />
  </div>
</template>

<script>
import { extractNodeModule } from './Scripts/ExtractTypesConfig'

export default {
  name: 'Extract',
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
  data() {
    return {
      pendingConfig: null,
      componentIsReady: false
    }
  },
  computed: {
    currentComponent() {
      const comp = extractNodeModule.getComponent(this.type);
      console.log('[Extract] Loading component for type:', this.type);
      return comp;
    }
  },
  watch: {
    type() {
      // Reset ready state when component type changes
      console.log('[Extract] Component type changed, resetting ready state');
      this.componentIsReady = false;
    }
  },
  mounted() {
    console.log('[Extract] Component mounted');
  },
  methods: {
    onComponentReady() {
      console.log('[Extract] Child component signaled ready');
      this.componentIsReady = true;
      this.applyPendingConfig();
    },
    applyPendingConfig() {
      if (this.pendingConfig && this.componentIsReady) {
        console.log('[Extract] Applying pending config:', this.pendingConfig);
        if (this.$refs.child && typeof this.$refs.child.setConfig === 'function') {
          this.$refs.child.setConfig(this.pendingConfig);
          this.pendingConfig = null;
        } else {
          console.error('[Extract] Child component ready but setConfig method not available');
        }
      }
    },
    onPayload(payload) {
      console.log('[Extract] Forwarding update-payload:', payload);
      this.$emit('update-payload', payload);
    },
    getConfig() {
      if (!this.componentIsReady || !this.$refs.child || typeof this.$refs.child.getConfig !== 'function') {
        console.log('[Extract] getConfig called but component not ready or method not available');
        return {};
      }
      
      console.log('[Extract] Getting config from child component');
      return this.$refs.child.getConfig();
    },
    setConfig(config) {
      console.log('[Extract] setConfig called with:', config);
      
      if (!this.componentIsReady || !this.$refs.child || typeof this.$refs.child.setConfig !== 'function') {
        console.log('[Extract] Component not ready, storing config for later');
        this.pendingConfig = config;
        return;
      }
      
      console.log('[Extract] Setting config on child component');
      this.$refs.child.setConfig(config);
    }
  }
}
</script>

<style scoped>
.extract-container {
  padding: 1rem;
}
</style>