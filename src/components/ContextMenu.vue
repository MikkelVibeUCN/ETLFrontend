<template>
  <div class="context-menu" :style="{ top: `${y}px`, left: `${x}px` }" @mousedown.stop @click.stop="">
    <div class="menu-item" @mouseenter="menu.open = 'add'" @mouseleave="menu.open = null" data-arrow="→">
      Add
      <div v-if="menu.open === 'add'" class="submenu">
        <div
          v-for="(items, type) in subMenus"
          :key="type"
          class="submenu-item"
          :class="{ disabled: items.length === 0 }"
          @mouseenter="menu.openSub = type as NodeGroup"
          @mouseleave="menu.openSub = null"
          :data-arrow="items.length > 0 ? '→' : ''"
        >
          {{ type.charAt(0).toUpperCase() + type.slice(1) }}

          <div v-if="menu.openSub === type && items.length > 0" class="submenu deep">
            <div
              v-for="item in items"
              :key="item.version"
              class="submenu-item"
              :class="{ disabled: !item.enabled }"
              @click="item.enabled && emitAdd(type as NodeGroup, item.version)"
            >
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, computed } from 'vue'
import { nodeRegistry, type NodeGroup, type NodeDefinition  } from '../shared/types/nodeRegistry'

export default defineComponent({
  name: 'ContextMenu',
  props: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  emits: ['add-node'],
  data() {
    return {
      menu: {
        open: null as 'add' | null,
        openSub: null as NodeGroup | null
      }
    }
  },
  computed: {
    subMenus(): Record<NodeGroup, NodeDefinition[]> {
      return nodeRegistry
    }
  },
  methods: {
    emitAdd(type: NodeGroup, version: string) {
      this.$emit('add-node', version) // just the type/version
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