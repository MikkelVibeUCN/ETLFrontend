<template>
    <div v-if="inputType !== 'none'" class="rule-input-wrapper">
      <input
        v-if="inputType === 'text'"
        v-model="model"
        type="text"
        class="rule-input"
      />
      <input
        v-else-if="inputType === 'number'"
        v-model.number="model"
        type="number"
        class="rule-input"
      />  
      <select
        v-else-if="inputType === 'select'"
        v-model="model"
        class="rule-input"
      >
        <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <input
        v-else-if="inputType === 'checkbox'"
        v-model="model"
        type="checkbox"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, defineProps } from 'vue'
  
  const props = defineProps<{
    inputType: 'text' | 'number' | 'select' | 'checkbox' | 'none'
    modelValue: any
    options?: string[]
  }>()
  
  const emit = defineEmits(['update:modelValue'])
  
  const model = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })
  </script>
  
  <style scoped>
  .rule-input-wrapper {
    flex: 1;
  }
  .rule-input {
    width: 100%;
    background-color: #2e2e2e;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    color: white;
  }
  </style>
  