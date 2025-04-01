<template>
    <div class="rules-container">
      <div v-for="node in nodes" :key="node.name" class="field-node">
        <div class="field-header">
          <strong>{{ node.name }}</strong>
          <input
            v-model="node.rule"
            placeholder="Enter rule..."
            @input="emitChange"
            class="rule-input"
          />
        </div>
  
        <div v-if="node.children?.length" class="field-children">
          <Rules :nodes="node.children" @update="emitChange" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits, onMounted} from 'vue'
  
  interface FieldNode {
    name: string
    selected: boolean
    rule?: string // Optional rule field added here
    children?: FieldNode[]
  }
  
  const props = defineProps<{
    nodes: FieldNode[]
  }>()
  
  const emit = defineEmits(['update'])
  
  function emitChange() {
    emit('update', props.nodes)
  }
  onMounted(() => {
  console.log('Rules.vue mounted with nodes:', props.nodes)
})

  </script>
  
  <style scoped>
  .rules-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .field-node {
    border: 1px solid #ddd;
    padding: 0.75rem;
    border-radius: 8px;
  }
  
  .field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  
  .rule-input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .field-children {
    margin-top: 0.75rem;
    padding-left: 1rem;
    border-left: 2px dashed #ccc;
  }
  </style>
  