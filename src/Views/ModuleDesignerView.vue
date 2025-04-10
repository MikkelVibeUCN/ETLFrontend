<template>
  <div class="main-wrapper">
    <div class="navbar">
      <h1 class="title">{{ title }}</h1>
      <div class="navbar-items">
        <div 
          v-for="(navItem, i) in navbarItems" 
          :key="i" 
          class="navbar-item" 
          @click="navItem.clickEvent"
        >
          <img class="icon" :src="navItem.iconPath" />
          <span class="navbar-item-label">{{ navItem.name }}</span>
        </div>
      </div>
    </div>

    <DraggableCanvas ref="canvasRef" :config="config" />

    <Popup 
      :isVisible="showIdModal" 
      title="Set Config ID" 
      placeholder="Enter the ID for the config"
      inputType="text" 
      initialValue="" 
      @set-value="setId" 
      @close="closeIdModal" 
    />

    <Popup 
      :isVisible="showUpdateModal" 
      title="Update config?" 
      @set-value="handleConfigSave" 
      @close="closeUpdateModal" 
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DraggableCanvas from '../components/DraggableCanvas.vue'
import Extract from '../components/Extract/Extract.vue'
import Transform from '../components/Transform/Transform.vue'
import { createBlankConfig, type PipelineConfig } from '../shared/scripts/PipelineConfig'
import { ConfigService } from '../shared/scripts/Services/ConfigService'
import Popup from '../components/shared/Popup.vue'

export default defineComponent({
  name: 'ModuleDesignerView',
  
  components: {
    DraggableCanvas,
    Extract,
    Transform,
    Popup
  },
  
  data() {
    return {
      title: "Module Designer",
      navbarItems: [] as { iconPath: string; name: string; clickEvent: () => void }[],
      config: null as PipelineConfig | null,
      isLoadingConfig: false,
      showIdModal: false,
      showUpdateModal: false,
      pendingConfig: null as PipelineConfig | null // Stores config waiting for user action
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
    await this.loadInitialConfig()
  },
  
  methods: {
    async loadInitialConfig() {
      if (this.isLoadingConfig) return;
      this.isLoadingConfig = true;

      try {
        const id = this.$route.params.id as string

        if (id !== "new") {
          try {
            this.config = await ConfigService.getConfig(id)
            
            const canvas = this.$refs.canvasRef as any
            if (canvas?.loadFromPipelineConfig && this.config) {
              canvas.loadFromPipelineConfig(this.config)
            }
          } catch (error) {
            console.error("Failed to load config:", error)
            this.config = createBlankConfig()
          }
        } else {
          this.config = createBlankConfig()
        }
      } finally {
        this.isLoadingConfig = false;
      }
    },
    
    async save() {
      // Get the latest config from the canvas
      const canvas = this.$refs.canvasRef as any;
      if (!canvas) {
        console.error("Canvas reference not found");
        return;
      }
      
      const newConfig = canvas.exportPipeline();
      if (!newConfig) {
        console.error("Failed to export pipeline configuration");
        return;
      }
      
      // Preserve ID if we already have one
      if (this.config?.Id) {
        newConfig.Id = this.config.Id;
      }
      
      // Store as pending config
      this.pendingConfig = newConfig as PipelineConfig;
      
      // If no ID is set, prompt user to set one
      if (!this.pendingConfig.Id) {
        this.showIdModal = true;
        return;
      }
      
      // Check if config exists before proceeding
      await this.checkExistingAndSave();
    },
    
    async checkExistingAndSave() {
      if (!this.pendingConfig?.Id) return;
      
      try {
        const existingConfig = await ConfigService.getConfig(this.pendingConfig.Id);
        
        if (existingConfig) {
          // Config exists - prompt for update confirmation
          this.showUpdateModal = true;
        } else {
          // This should never happen since getConfig should throw if not found
          await this.handleConfigSave();
        }
      } catch (error) {
        // If getConfig throws an error, it likely means the config doesn't exist
        // Proceed with creation
        await this.handleConfigSave();
      }
    },
    
    async handleConfigSave() {
      if (!this.pendingConfig?.Id) {
        console.error("Cannot save: pendingConfig or ID is missing");
        return;
      }
      
      try {
        const id = this.pendingConfig.Id;
        
        try {
          // Check if config exists
          await ConfigService.getConfig(id);
          
          // Config exists, update it
          await ConfigService.updateConfig(id, this.pendingConfig);
          console.log("Successfully updated config:", id);
        } catch {
          // Config doesn't exist, create it
          await ConfigService.saveConfig(this.pendingConfig);
          console.log("Successfully created config:", id);
        }
        
        // Update the main config reference
        this.config = this.pendingConfig;
        
        // Close modals
        this.closeIdModal();
        this.closeUpdateModal();
      } catch (error) {
        console.error("Failed to save config:", error);
      }
    },
    
    setId(id: string) {
      if (!this.pendingConfig) {
        console.error("Cannot set ID: pendingConfig is null");
        return;
      }
      
      this.pendingConfig.Id = id;
      this.closeIdModal();
      
      // Continue with save process
      this.checkExistingAndSave();
    },
    
    discard() {
      console.log("Discard clicked")
      // Implement discard functionality
    },
    
    showTemplates() {
      console.log("Show templates")
      // Implement templates functionality
    },
    
    showHelp() {
      console.log("Show help")
      // Implement help functionality
    },
    
    closeIdModal() {
      this.showIdModal = false;
      if (!this.pendingConfig?.Id) {
        // Clear pending config if no ID was set
        this.pendingConfig = null;
      }
    },
    
    closeUpdateModal() {
      this.showUpdateModal = false;
      // Clear pending config if user cancels update
      if (this.showUpdateModal) {
        this.pendingConfig = null;
      }
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