<template>
    <ul class="tree-list">
      <li v-for="(node, index) in nodes" :key="index">
        <label>
          <input
            type="checkbox"
            v-model="node.selected"
            @change="toggleChildren(node)"
          />
          {{ node.name }}
        </label>
  
        <ul v-if="node.children" class="tree-list">
          <li v-for="(child, cIndex) in node.children" :key="cIndex">
            <label :class="{ disabled: !node.selected }">
              <input
                type="checkbox"
                v-model="child.selected"
                :disabled="!node.selected"
                @change="toggleChildren(child)"
              />
              {{ child.name }}
            </label>
  
            <!-- Recursive children -->
            <TreeCheckbox
              v-if="child.children"
              :nodes="child.children"
            />
          </li>
        </ul>
      </li>
    </ul>
  </template>
  
  
  <script lang="ts">
  import { defineComponent, type PropType } from 'vue';
  import type { FieldNode } from '../../../../Shared Scripts/jsonTreeBuilder';
  
  export default defineComponent({
    name: 'TreeCheckbox',
    props: {
      nodes: {
        type: Array as PropType<FieldNode[]>,
        required: true
      }
    },
    methods: {
      toggleChildren(node: FieldNode) {
        if (node.children) {
          node.children.forEach(child => {
            child.selected = node.selected;
            this.toggleChildren(child);
          });
        }
      }
    }
  });
  </script>
  
  <style scoped>
  .tree-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }
  
  .tree-list li {
    margin-left: 1rem;
    text-align: left;
  }
  
  .tree-list label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: left;
  }
  
  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  </style>
  