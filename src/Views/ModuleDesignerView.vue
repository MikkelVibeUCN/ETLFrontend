<template>
  <div class="main-wrapper">
    <div class="navbar">
      <h1 class="title">{{ title }}</h1>
      <div class="navbar-items">
        <div
          class="navbar-item"
          v-for="(navItem, i) in navbarItems"
          :key="i"
          @click="navItem.clickEvent"
        >
          <img class="icon" :src="navItem.iconPath" />
          <span class="navbar-item-label">{{ navItem.name }}</span>
        </div>
      </div>
    </div>

    <DraggableCanvas ref="canvasRef" :config="config" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import DraggableCanvas from '../components/DraggableCanvas.vue'
import Extract from '../components/Extract/Extract.vue'
import Transform from '../components/Transform/Transform.vue'
import type { PipelineConfig } from '../shared/scripts/PipelineConfig'
import { ConfigService } from '../shared/scripts/Services/ConfigService'

export default defineComponent({
  name: 'ModuleDesignerView',
  components: {
    DraggableCanvas,
    Extract,
    Transform
  },
  data() {
    return {
      title: "ETL-Module Designer",
      navbarItems: [] as { iconPath: string; name: string; clickEvent: () => void }[],
      config: null as PipelineConfig | null
    }
  },
  created() {
    this.navbarItems = [
      { iconPath: "/save.png", name: "Save", clickEvent: this.save },
      { iconPath: "/discard.png", name: "Discard", clickEvent: this.discard },
      { iconPath: "/templates.png", name: "Templates", clickEvent: this.showTemplates },
      { iconPath: "/help.png", name: "Help", clickEvent: this.showHelp }
    ]
  },
  async mounted() {
    await this.loadConfigToCanvas()
  },
  watch: {
    config: {
      deep: true,
      handler() {
        this.loadConfigToCanvas()
      }
    }
  },
  methods: {
    async loadConfigToCanvas() {
      const route = useRoute()
      const id = route.params.id as string
      this.config = await ConfigService.getConfig(id)

      const canvas = this.$refs.canvasRef as any
      if (canvas?.loadFromPipelineConfig) {
        canvas.loadFromPipelineConfig(this.config)
      } else {
        console.warn("DraggableCanvas ref not found or loadFromPipelineConfig not available")
      }
    },
    async save() {
      if(this.config) {
        console.log("Saving to database", this.config)

        try {
          await ConfigService.saveConfig(this.config);
          console.log("Saved config")
        }
        catch(e) {
          console.log("Failed to save to  database error: " + e)
        }

      }
    },
    discard() {
      console.log("Discard clicked")
    },
    showTemplates() {
      console.log("Show templates")
    },
    showHelp() {
      console.log("Show help")
    }
  }
})
</script>

<style scoped>
.main-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.navbar {
  background-color: #2c2c2c;
  padding: 10px 20px;
  color: #fff;
  border-bottom: 2px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1.5em;
}

.navbar-items {
  display: flex;
  gap: 20px;
}

.navbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.navbar-item:hover {
  background-color: #444;
}

.icon {
  width: 20px;
  height: 20px;
}

.navbar-item-label {
  font-size: 0.95em;
  color: white;
}
</style>
