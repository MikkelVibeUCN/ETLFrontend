<template>
  <div class="configs-view">
    <div class="header">
      <h2>Configs</h2>
      <button @click="createNewConfig">New Config</button>
    </div>
    <ul>
      <li v-for="config in configs" :key="config.Id" class="config-item">
  <span>{{ config.Id }}</span>
  <div class="button-group">
    <span
      class="status-indicator"
      :class="configStatuses[config.Id]"
    >
      {{ statusText(configStatuses[config.Id]) }}
    </span>
    <button class="edit-btn" @click="editConfig(config.Id)">Edit</button>
    <button
      class="run-btn"
      @click="runConfig(config.Id)"
      :disabled="configStatuses[config.Id] === 'running'"
    >
      Run
    </button>
  </div>
</li>


    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { ConfigService } from '../shared/scripts/Services/ConfigService'
import { type PipelineConfig, createBlankConfig } from '../shared/scripts/PipelineConfig'
import { ExtractService } from '../shared/scripts/Services/ExtractService'
const configs = ref<PipelineConfig[]>([])

type ConfigStatus = 'idle' | 'running' | 'completed' | 'failed'

const configStatuses = ref<Record<string, ConfigStatus>>({})

const router = useRouter()

function editConfig(configId: string | undefined) {
  if (configId !== undefined)
    router.push(`/pipeline/edit/${configId}`)
}

onMounted(async () => {
  configs.value = await ConfigService.getAllConfigs()
})

function createNewConfig() {
  router.push(`/pipeline/edit/new`)
}

async function runConfig(configId: string) {
  configStatuses.value[configId] = 'running'
  try {
    await ExtractService.startPipeline(configId)
    
    configStatuses.value[configId] = 'completed'
  } catch (err: any) {
    if (err?.response?.status === 500) {
      configStatuses.value[configId] = 'failed'
    } else {
      configStatuses.value[configId] = 'failed' 
    }
  }
}
function statusText(status?: ConfigStatus) {
  switch (status) {
    case 'running': return 'Running...'
    case 'completed': return 'Completed'
    case 'failed': return 'Failed'
    default: return ''
  }
}





</script>

<style scoped>
.configs-view {
  background-color: #1e1e1e;
  padding: 1.5rem 2rem;
  color: white;
  height: 100%;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.6rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  margin-bottom: 0.5rem;
  background-color: #2c2c2c;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.config-item:hover {
  background-color: #3a3a3a;
}

button {
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.button-group {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.edit-btn {
  background-color: #ff9800; 
}

.edit-btn:hover {
  background-color: #e68900;
}

.run-btn {
  background-color: #4caf50; 
}

.run-btn:hover {
  background-color: #3d8b40;
}
.status-indicator {
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem; 
  font-weight: bold;
  text-align: center;
}


.status-indicator.running {
  color: #fbc02d;
}

.status-indicator.completed {
  color: #4caf50; 
}

.status-indicator.failed {
  color: #f44336; 
}

</style>
