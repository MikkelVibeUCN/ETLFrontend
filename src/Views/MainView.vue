<template>
  <div class="main-wrapper">
    <div class="navbar">
      <h1 class="title">{{ title }}</h1>
      <div class="navbar-items">
        <div class="navbar-item" v-for="(navItem, i) in navbarItems" :key="i" @click="navItem.clickEvent">
          <img class="icon" :src="navItem.iconPath" />
          <span class="navbar-item-label">{{ navItem.name }}</span>
        </div>
      </div>
    </div>

    <DraggableCanvas ref="canvasRef" />

  </div>
</template>


<script lang="ts">
import DraggableCanvas from '../components/DraggableCanvas.vue'
import Extract from '../components/Extract/Extract.vue'
import Transform from '../components/Transform/Transform.vue';

export default {
  name: 'MainView',
  components: {
    DraggableCanvas,
    Extract,
    Transform
  },
  data() {
    return {
      title: "ETL-Module Designer",
      navbarItems: [] as { iconPath: string; name: string; clickEvent: () => void }[]
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
  methods: {
    save() {
      const canvas = this.$refs.canvasRef as { exportPipeline: () => any }

      if (canvas) {
        const config = canvas.exportPipeline()
        console.log("Config from DraggableCanvas:", config)
      } else {
        console.warn("DraggableCanvas ref not found")
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
}
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
