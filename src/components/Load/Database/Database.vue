// File: database.vue
<template>
    <div class="database-container">
        <h2 class="title">Select Database Type</h2>
        <select v-model="selectedDb" @change="loadComponent" class="input select">
            <option disabled value="">-- Choose Database --</option>
            <option v-for="db in databaseOptions" :key="db.value" :value="db.value">
                {{ db.label }}
            </option>
        </select>

        <component :is="componentMap[selectedDb]" v-if="selectedDb" :fieldTree="fieldTree" ref="dbComponent"/>

    </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { databaseOptions, type LoadConfig } from '../loadConfig'
import MySQLContent from './MySQL/MySQLContent.vue'

import type { FieldNode } from '../../../shared/scripts/jsonTreeBuilder'

defineProps<{
  fieldTree: FieldNode[]
}>()

defineExpose({
  getConfig,
  setConfig
})

const selectedDb = ref('')
const dbComponent = ref()

function setConfig(config: LoadConfig) {
  const dbType = config?.LoadTargetConfig?.TargetInfo?.$type

  if (!dbType || !componentMap[dbType]) {
    console.warn(`[Database] Unsupported or unknown database type: "${dbType}"`)
    return
  }

  selectedDb.value = dbType

  // wait for component to render, then pass config down
  nextTick(() => {
    if (dbComponent.value?.setConfig) {
      dbComponent.value.setConfig(config)
    }
  })
}


function getConfig() {
  if (!selectedDb.value || !dbComponent.value?.getConfig) {
    throw new Error('No database component loaded or missing getConfig.')
  }

  return dbComponent.value.getConfig()
}

const componentMap: Record<string, any> = {
    mysql: MySQLContent,
    // Future databases can be added and mapped here
}

function loadComponent() {
    // component loading is handled reactively
}
</script>

<style scoped>
.database-container {
    padding: 1rem;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
}

.input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    width: 100%;
    color: white;
}

.select {
    margin-bottom: 1rem;
}

.title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: white;
}
</style>