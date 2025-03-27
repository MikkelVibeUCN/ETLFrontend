<template>
    <div class="row-with-label">
      <label class="left-label" for="url">HTTP GET URL</label>
      <input id="url" v-model="urlModel" placeholder="Enter URL..." />
    </div>
  </template>
  
  
  <script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);

// Create a writable proxy for the v-model binding
const urlModel = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
});
</script>

  
<style scoped>
.row-with-label {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 0.5rem;
  box-sizing: border-box;
}

.left-label {
  flex: 0 0 auto;
  min-width: 100px;
  max-width: 150px;
  width: 100%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  margin-top: 6px;
  box-sizing: border-box;
}

input {
  flex: 1;
  padding: 6px;
  min-width: 0;
  box-sizing: border-box;
}
</style>
