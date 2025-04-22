<template>
  <div>
    <h3 class="title">MySQL Connection</h3>
    <form @submit.prevent="testConnection">
      <div class="form-row">
        <div class="form-group">
          <label>Server name</label>
          <input v-model="host" @input="validationErrors.host = ''" placeholder="e.g. 127.0.0.1" class="input" />
          <span v-if="validationErrors.host" class="field-error">{{ validationErrors.host }}</span>
        </div>

        <div class="form-group">
          <label>Port</label>
          <input v-model="port" @input="validationErrors.port = ''" type="number" placeholder="3306" class="input" />
          <span v-if="validationErrors.port" class="field-error">{{ validationErrors.port }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Login</label>
          <input v-model="user" @input="validationErrors.user = ''" placeholder="e.g. root" class="input" />
          <span v-if="validationErrors.user" class="field-error">{{ validationErrors.user }}</span>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" @input="validationErrors.password = ''" type="password" placeholder="Password" class="input" />
          <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>Database</label>
        <input v-model="database" @input="validationErrors.database = ''" placeholder="e.g. my_database" class="input" />
        <span v-if="validationErrors.database" class="field-error">{{ validationErrors.database }}</span>
      </div>

      <button type="submit" class="btn">Load Database</button>
      <div v-if="errorMessage" class="field-error">{{ errorMessage }}</div>
    </form>

    <div v-if="connected" class="connected">
      <label>Table Mode</label>
      <select v-model="isCreatingNew" class="input">
        <option :value="false">Use Existing Table</option>
        <option :value="true">Create New Table</option>
      </select>

      <div v-if="!isCreatingNew">
        <label>Select Existing Table</label>
        <select v-model="selectedTable" class="input">
          <option disabled value="">-- Select Table --</option>
          <option v-for="table in tables" :key="table" :value="table">{{ table }}</option>
        </select>
      </div>

      <div v-else>
        <label>New Table Name</label>
        <input v-model="newTableName" placeholder="e.g. new_table" class="input" />
      </div>

      <label>Assign Fields to Table</label>

      <div v-if="!isCreatingNew && selectedTable" class="field-selector">
        <div v-for="column in selectedTableColumns" :key="column" class="checkbox-row">
          <label>{{ column }}</label>
          <select v-model="existingTableFieldMap[column]" class="input">
            <option disabled value="">-- Select Field --</option>
            <option v-for="field in allFields" :key="field.path" :value="field.path">
              {{ getDisplayName(field) }}
            </option>
          </select>
        </div>
      </div>

      <div v-else class="field-selector">
        <div v-for="field in unmappedFields" :key="field.path" class="checkbox-row">
          <label>
            <input type="checkbox" v-model="field.selected" />
            {{ getDisplayName(field) }} ({{ field.dataType }})
          </label>
        </div>
      </div>


      <label>Load Mode</label>
      <select v-model="loadMode" class="input">
        <option value="append">Append</option>
        <option value="truncate">Truncate + Insert</option>
        <option value="insert_ignore">Insert Ignore</option>
      </select>

      <button class="btn" @click="confirmMapping">Confirm Table Mapping</button>
    </div>

    <div v-if="mappedTables.length" class="mapped-tables">
      <h4 class="subtitle">Mapped Tables</h4>
      <div v-for="table in mappedTables" :key="table.name" class="mapped-table">
        <strong>{{ table.name }}</strong>
        <ul>
          <li v-for="field in table.fields" :key="field.path">
            {{ getDisplayName(findFieldByPath(field.path)) }}
            ({{ findFieldByPath(field.path)?.dataType || 'unknown' }})
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { type FieldNode } from '../../../../shared/scripts/jsonTreeBuilder'
import { type LoadConfig } from '../../loadConfig'
import { ConfigService } from '../../../../shared/scripts/Services/ConfigService'
import type { database } from '../../../../shared/types/databaseFormat'

const props = defineProps<{ fieldTree: FieldNode[] }>()
const validationErrors = ref<Record<string, string>>({})
const errorMessage = ref('')

interface MappedFieldNode extends FieldNode {
  path: string,
  selected: boolean
}

const mappedTables = ref<{ name: string; fields: MappedFieldNode[] }[]>([])
const host = ref('')
const port = ref(3306)
const user = ref('')
const password = ref('')
const database = ref('')
const selectedTable = ref('')
const newTableName = ref('')
const tables = ref<string[]>([])
const loadMode = ref('append')
const connected = ref(false)
const isCreatingNew = ref(false)
const fieldNodes = ref<FieldNode[]>([])
const fullMetadata = ref<database | null>(null)
const existingTableFieldMap = ref<Record<string, string>>({})

const selectedTableColumns = computed(() => {
  if (!fullMetadata.value || !selectedTable.value) return []
  return fullMetadata.value.tables.find(t => t.tableName === selectedTable.value)?.columns || []
})

watch(() => props.fieldTree, (newVal) => {
  if (Array.isArray(newVal)) fieldNodes.value = newVal
}, { immediate: true })

watch(selectedTable, () => {
  existingTableFieldMap.value = {}
})

defineExpose({ getConfig, setConfig })

function getConfig(): LoadConfig {
  const connectionString = `Server=${host.value};Port=${port.value};User Id=${user.value};Password=${password.value};Database=${database.value};`
  return {
    TargetInfo: {
      $type: 'mysql',
      ConnectionString: connectionString,
      LoadMode: loadMode.value
    },
    Tables: mappedTables.value.map(table => ({
      TargetTable: table.name,
      Fields: table.fields.map(f => f.path)
    }))
  }
}

function createFallbackField(path: string): MappedFieldNode {
  return {
    name: path.split('.').pop() || path,
    path,
    dataType: 'unknown',
    selected: false,
    rules: [],
    ruleValues: {},
    children: [],
    _expanded: false
  }
}

function setConfig(config: LoadConfig) {
  const info = config.TargetInfo
  const tables = config.Tables || []
  if (info?.ConnectionString) {
    const parts = Object.fromEntries(info.ConnectionString.split(';')
      .filter(Boolean).map(p => p.split('=')))
    host.value = parts.Server || ''
    port.value = Number(parts.Port || 3306)
    user.value = parts['User Id'] || ''
    password.value = parts.Password || ''
    database.value = parts.Database || ''
  }
  loadMode.value = info?.LoadMode || 'append'
  connected.value = true

  const stop = watch(() => fieldNodes.value.length, (len) => {
    if (len > 0) {
      mappedTables.value = tables.map(t => ({
        name: t.TargetTable,
        fields: t.Fields.map(path => {
          const found = findFieldByPath(path)
          return found ? { ...found, path } : createFallbackField(path)

        })
      }))
      stop()
    }
  }, { immediate: true })
}

function validateFields(): boolean {
  const errors: Record<string, string> = {}
  if (!host.value) errors.host = 'Server name is required.'
  if (!port.value) errors.port = 'Port is required.'
  if (!user.value) errors.user = 'Login is required.'
  if (!password.value) errors.password = 'Password is required.'
  if (!database.value) errors.database = 'Database name is required.'
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

async function testConnection() {
  errorMessage.value = ''
  if (!validateFields()) return
  try {
    const config = getConfig()
    connected.value = await ConfigService.validateLoadConfig(config)

    if (connected.value) {
      const metadataDb = await ConfigService.loadMetadata(config) as database
      fullMetadata.value = metadataDb
      tables.value = metadataDb.tables.map(t => t.tableName)
    } else {
      errorMessage.value = 'Connection test failed. Please verify your credentials.'
    }
  } catch (err: any) {
    connected.value = false
    errorMessage.value =
      err?.message || 'Connection failed. Please check your settings.'
  }
}


function getDisplayName(field: FieldNode | undefined): string {
  if (!field) return '(missing)'
  const key = `${field.name}_change_name`
  return field.rules?.includes('change_name') && field.ruleValues?.[key]
    ? field.ruleValues[key]
    : field.name
}

function findFieldByPath(path: string): FieldNode | undefined {
  const parts = path.split('.')
  let current: FieldNode | undefined
  let level = fieldNodes.value
  for (const part of parts) {
    current = level.find(n => n.name === part)
    if (!current) return undefined
    level = current.children || []
  }
  return current
}

function flattenFields(node: FieldNode, parentPath = ''): MappedFieldNode[] {
  const path = parentPath ? `${parentPath}.${node.name}` : node.name
  return node.children?.length
    ? node.children.flatMap(child => flattenFields(child, path))
    : [{ ...node, path }]
}

function flattenTree(tree: FieldNode[]): MappedFieldNode[] {
  return tree.flatMap(node => flattenFields(node))
}

const allFields = computed(() => flattenTree(fieldNodes.value))
const mappedPaths = computed(() => new Set(mappedTables.value.flatMap(t => t.fields.map(f => f.path))))
const unmappedFields = computed(() => allFields.value.filter(f => !mappedPaths.value.has(f.path)))

function confirmMapping() {
  const tableName = isCreatingNew.value ? newTableName.value : selectedTable.value
  if (!tableName) return

  let fields: MappedFieldNode[] = []

  if (isCreatingNew.value) {
    fields = unmappedFields.value.filter(f => f.selected)
  } else {
    fields = Object.entries(existingTableFieldMap.value)
      .filter(([_, path]) => path)
      .map(([_, path]) => {
        const found = findFieldByPath(path)
        return found ? { ...found, path } : createFallbackField(path)

      })
  }

  if (!fields.length) return

  const existing = mappedTables.value.find(t => t.name === tableName)
  if (existing) {
    const newFields = fields.filter(f => !existing.fields.find(m => m.path === f.path))
    existing.fields.push(...newFields)
  } else {
    mappedTables.value.push({ name: tableName, fields })
  }

  if (isCreatingNew.value) {
    fields.forEach(f => (f.selected = false))
    newTableName.value = ''
  } else {
    existingTableFieldMap.value = {}
    selectedTable.value = ''
  }
  isCreatingNew.value = false
}

watchEffect(() => {
  const existingPaths = new Set(allFields.value.map(f => f.path))
  for (const table of mappedTables.value) {
    table.fields = table.fields.filter(f => existingPaths.has(f.path))
  }
  mappedTables.value = mappedTables.value.filter(t => t.fields.length > 0)
})
</script>

<style scoped>

.field-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #1f1f1f;
  color: white;
}

.btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

label {
  margin-bottom: 0.25rem;
  color: white;
  display: block;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.connected {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.field-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.field-selector {
  background: #2e2e2e;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-row label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.subtitle {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;
  color: white;
}

.mapped-tables {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #2e2e2e;
  border-radius: 8px;
}

.mapped-table {
  margin-bottom: 1rem;
  color: white;
}

.mapped-table ul {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
  list-style-type: disc;
}

.mapped-table li {
  font-size: 0.95rem;
}
</style>
