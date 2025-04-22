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
          <button class="edit-btn" @click="editConfig(config.Id)">Edit</button>
          <button class="run-btn" @click="runConfig(config.Id)">Run</button>
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

const router = useRouter()

function editConfig(configId: string | undefined) {
  if (configId !== undefined)
    router.push(`/pipeline/edit/${configId}`)
}

onMounted(async () => {
  configs.value = await ConfigService.getAllConfigs()
})

function createNewConfig() {
  var newConfig = createBlankConfig()
  newConfig.Id = "new"
  configs.value.push(newConfig)
}

async function runConfig(configId: string) {
  await ExtractService.startPipeline(configId);
}

</script>

<style scoped>
.configs-view {
  background-color: #1e1e1e;
  padding: 1.5rem 2rem;
  color: white;
  height: 100%;
  /* Make sure the content is 100% of its container */
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
  /* Allow scrolling */
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
  background-color: #ff9800; /* orange */
}

.edit-btn:hover {
  background-color: #e68900;
}

.run-btn {
  background-color: #4caf50; /* green */
}

.run-btn:hover {
  background-color: #3d8b40;
}

</style>
