<template>
    <div
      class="context-menu"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @mousedown.stop
      @click.stop=""
    >
      <div
        class="menu-item"
        @mouseenter="menu.open = 'add'"
        @mouseleave="menu.open = null"
        data-arrow="→"
      >
        Add
        <div v-if="menu.open === 'add'" class="submenu">
          <div
            class="submenu-item"
            @mouseenter="menu.openSub = 'extract'"
            @mouseleave="menu.openSub = null"
            data-arrow="→"
          >
            Extract
            <div v-if="menu.openSub === 'extract'" class="submenu deep">
              <div class="submenu-item" @click="emitAdd('extract', 'API')">API</div>
              <div class="submenu-item" @click="emitAdd('extract', 'Test1')">Test1</div>
              <div class="submenu-item" @click="emitAdd('extract', 'Test2')">Test2</div>
              <div class="submenu-item" @click="emitAdd('extract', 'Test3')">Test3</div>
            </div>
          </div>
          <div class="submenu-item disabled">Transform</div>
          <div class="submenu-item disabled">Load</div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    name: 'ContextMenu',
    props: {
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      }
    },
    emits: ['add-node'],
    data() {
      return {
        menu: {
          open: null as string | null,
          openSub: null as string | null
        }
      }
    },
    methods: {
      emitAdd(type: string, name: string) {
        this.$emit('add-node', type, name)
      }
    }
  })
  </script>
  
  <style scoped>
  .context-menu {
    position: absolute;
    z-index: 1000;
    background-color: #2c2c2c;
    padding: 4px 0;
    border-radius: 6px;
    border: 1px solid #555;
    color: #fff;
    font-size: 0.9em;
    min-width: 160px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    font-family: sans-serif;
  }
  
  .menu-item,
  .submenu-item {
    position: relative;
    padding: 8px 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.15s ease;
    background-color: #2c2c2c;
  }
  
  .menu-item:hover:not(.disabled),
  .submenu-item:hover:not(.disabled) {
    background-color: #3a3a3a;
  }
  
  .submenu {
    position: absolute;
    top: 0;
    left: 100%;
    margin-left: -1px;
    background-color: #2c2c2c;
    border: 1px solid #555;
    border-radius: 6px;
    min-width: 160px;
    padding: 4px 0;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
    z-index: 1001;
  }
  
  .disabled {
    color: #777;
    cursor: not-allowed;
  }
  
  .disabled:hover {
    background-color: #2c2c2c;
  }
  
  .menu-item::after,
  .submenu-item::after {
    content: attr(data-arrow);
    float: right;
    color: #aaa;
  }
  </style>
  