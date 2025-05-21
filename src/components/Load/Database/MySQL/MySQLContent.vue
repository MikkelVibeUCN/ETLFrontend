<template>
  <div>
    <h3 class="title">Database Connection</h3>
    <form @submit.prevent="testConnection">
      <div class="form-row">
        <div class="form-group">
          <label>Database Type</label>
          <select v-model="databaseType" class="input">
            <option v-for="option in databaseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

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
          <input v-model="password" @input="validationErrors.password = ''" type="password" placeholder="Password"
            class="input" />
          <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Database</label>
          <input v-model="database" @input="validationErrors.database = ''" placeholder="e.g. my_database"
            class="input" />
          <span v-if="validationErrors.database" class="field-error">{{ validationErrors.database }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Additional config</label>
          <input v-model="extra" @input="validationErrors.extra = ''" placeholder="e.g. AllowPublicKeyRetrieval=True;"
            class="input" />
          <span v-if="validationErrors.extra" class="field-error">{{ validationErrors.extra }}</span>
        </div>
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
          <option v-for="table in tables" :key="table" :value="table"
            :disabled="mappedTables.some(mapped => mapped.name === table)">
            {{ table }} <span v-if="mappedTables.some(mapped => mapped.name === table)">(Mapped)</span>
          </option>
        </select>
      </div>


      <div v-else>
        <label>New Table Name</label>
        <input v-model="newTableName" placeholder="e.g. new_table" class="input" />
      </div>

      <label>Assign Fields to Table</label>

      <div v-if="!isCreatingNew && selectedTable" class="field-selector">
        <div v-for="column in filteredTableColumns" :key="column.columnName" class="checkbox-row">
          <label>
            {{ column.columnName }}
            <span class="column-type">({{ column.dataType }})</span>
            <span v-if="column.isNullable === false" class="required-field">*</span>
          </label>
          <select v-model="existingTableFieldMap[column.columnName]" class="input"
            :class="{ 'invalid-mapping': isMappingInvalid(column, existingTableFieldMap[column.columnName]) }">
            <option disabled value="">-- Select Field --</option>
            <option v-for="field in getCompatibleFields(column)" :key="field.path" :value="field.path">
              {{ getDisplayName(field) }} ({{ field.dataType }})
            </option>
          </select>
          <span v-if="isRequiredColumnUnmapped(column)" class="field-error">Required field!</span>
          <span v-if="isMappingInvalid(column, existingTableFieldMap[column.columnName])" class="field-error">
            Type mismatch!
          </span>
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

      <button class="btn" @click="confirmMapping" :disabled="hasMappingErrors">Confirm Table Mapping</button>
      <div v-if="hasMappingErrors" class="field-error">Please fix validation errors before confirming</div>
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
import { ConfigService } from '../../../../shared/scripts/Services/ConfigService'
import { createLoadConfig, type LoadConfig } from '../../loadConfig'
import type { DatabaseMetadata, DatabaseColumn } from '../../../../shared/types/databaseFormat'
import type { Table } from '../../loadConfig'
// Database options
const databaseOptions = [
  { label: "MySQL", value: "mysql" },
]

const props = defineProps<{ fieldTree: FieldNode[] }>()
const validationErrors = ref<Record<string, string>>({})
const errorMessage = ref('')

export interface MappedFieldNode extends FieldNode {
  path: string,
  selected: boolean
}

const mappedTables = ref<{ name: string; fields: MappedFieldNode[] }[]>([])
const databaseType = ref('mysql')
const host = ref('')
const port = ref(3306)
const user = ref('')
const password = ref('')
const database = ref('')
const extra = ref('')
const selectedTable = ref('')
const newTableName = ref('')
const tables = ref<string[]>([])
const loadMode = ref('append')
const connected = ref(false)
const isCreatingNew = ref(false)
const fieldNodes = ref<FieldNode[]>([])
const fullMetadata = ref<DatabaseMetadata | null>(null)
const existingTableFieldMap = ref<Record<string, string>>({})

const selectedTableColumns = computed(() => {
  if (!fullMetadata.value || !selectedTable.value) return []
  const table = fullMetadata.value.tables.find(t => t.tableName === selectedTable.value)
  return table?.columns || []
})

// Filter out auto-incrementing columns
const filteredTableColumns = computed(() => {
  return selectedTableColumns.value.filter(column => !column.isAutoIncrement)
})

const hasMappingErrors = computed(() => {
  if (isCreatingNew.value) return false

  return filteredTableColumns.value.some(column => {
    const fieldPath = existingTableFieldMap.value[column.columnName]
    return (
      (column.isNullable === false && !fieldPath) ||
      (fieldPath && isMappingInvalid(column, fieldPath))
    )
  })
})

watch(() => props.fieldTree, (newVal) => {
  if (Array.isArray(newVal)) fieldNodes.value = newVal
}, { immediate: true })

watch(selectedTable, () => {
  existingTableFieldMap.value = {}
})

defineExpose({ getConfig, setConfig })

function getConfig(): LoadConfig {
  return createLoadConfig(
    databaseType.value,
    loadMode.value,
    mappedTables.value,
    host.value,
    port.value,
    user.value,
    password.value,
    database.value,
    extra.value
  ) as LoadConfig
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

async function setConfig(config: LoadConfig) {
  const info = config.TargetInfo
  const newTables = config.Tables as Table[]

  if (info?.$type) {
    databaseType.value = info.$type
  }

  if (info?.ConnectionString) {
    const pairs = info.ConnectionString
  .split(';')
  .filter(Boolean)
  .map(p => {
    const [key, value] = p.split('=');
    return [key.toLowerCase(), value];
  });

    const knownKeys = ['server', 'port', 'user', 'password', 'database']
    const configMap = Object.fromEntries(pairs)

    host.value = configMap.server || ''
    port.value = Number(configMap.port || 3306)
    user.value = configMap['user'] || ''
    password.value = configMap.password || ''
    database.value = configMap.database || ''

    // Build `extra` from unknown keys
    extra.value = pairs
      .filter(([key]) => !knownKeys.includes(key))
      .map(pair => pair.join('='))
      .join(';')

    if (extra.value) {
      extra.value += ';'
    }
  }

  loadMode.value = info?.LoadMode || 'append'

  await testConnection()

  watch(() => fieldNodes.value.length, (len) => {
    if (len > 0) {
      mappedTables.value = newTables.map(t => ({
        name: t.TargetTable,
        fields: t.Fields.map(({ SourceField, TargetField }) => {
          const found = findFieldByPath(SourceField)
          const baseField = found ? { ...found, path: SourceField } : createFallbackField(SourceField)
          return { ...baseField, path: TargetField }
        })
      }))
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
      const metadataDb = await ConfigService.loadMetadata(config) as DatabaseMetadata
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

  // For simple paths (no hierarchy), first try to match by the original name
  // or by the transformed name if available
  if (parts.length === 1) {
    const fieldName = parts[0]

    // First try to find by original name
    const directMatch = fieldNodes.value.find(n => n.name === fieldName)
    if (directMatch) return directMatch

    // If not found by original name, try to find by transformed name
    return fieldNodes.value.find(n =>
      n.rules?.includes('change_name') &&
      n.ruleValues?.[`${n.name}_change_name`] === fieldName
    )
  }

  // For hierarchical paths, use the original logic
  let current: FieldNode | undefined
  let level = fieldNodes.value
  for (const part of parts) {
    current = level.find(n => n.name === part)
    if (!current) {
      // If not found by original name, try to find by transformed name
      current = level.find(n =>
        n.rules?.includes('change_name') &&
        n.ruleValues?.[`${n.name}_change_name`] === part
      )
      if (!current) return undefined
    }
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

// Type compatibility checking
function isTypeCompatible(dbType: string, fieldType: string): boolean {
  dbType = dbType.toLowerCase()
  fieldType = fieldType.toLowerCase()

  const isDbNumeric = /int|decimal|float|double|number|numeric/i.test(dbType)

  const isFieldNumeric = /number|int|float|decimal|double/i.test(fieldType)

  const isDbText = /varchar|char|text|string/i.test(dbType)

  const isFieldText = /string|text/i.test(fieldType)

  const isDbDateTime = /date|time|timestamp/i.test(dbType)

  const isFieldDateTime = /date|time/i.test(fieldType)

  if (isDbText && isFieldNumeric) return true

  return (isDbNumeric && isFieldNumeric) ||
    (isDbText && isFieldText) ||
    (isDbDateTime && isFieldDateTime) ||
    dbType === fieldType
}

function isMappingInvalid(column: DatabaseColumn, fieldPath: string): boolean {
  if (!fieldPath) return false

  const field = findFieldByPath(fieldPath)
  if (!field || !field.dataType) return false

  return !isTypeCompatible(column.dataType, field.dataType)
}

function isRequiredColumnUnmapped(column: DatabaseColumn): boolean {
  return column.isNullable === false && !existingTableFieldMap.value[column.columnName]
}

function getCompatibleFields(column: DatabaseColumn): MappedFieldNode[] {
  return allFields.value.filter(field => {
    if (!field.dataType) return true

    return isTypeCompatible(column.dataType, field.dataType)
  })
}

const allFields = computed(() => flattenTree(fieldNodes.value))
const mappedPaths = computed(() => new Set(mappedTables.value.flatMap(t => t.fields.map(f => f.path))))
const unmappedFields = computed(() => allFields.value.filter(f => !mappedPaths.value.has(f.path)))

function confirmMapping() {
  const tableName = isCreatingNew.value ? newTableName.value : selectedTable.value
  if (!tableName) return

  // Check if there are validation errors when using existing table
  if (!isCreatingNew.value && hasMappingErrors.value) {
    return
  }

  let fields: MappedFieldNode[] = []

  if (isCreatingNew.value) {
    fields = unmappedFields.value.filter(f => f.selected)
  } else {
    fields = Object.entries(existingTableFieldMap.value)
      .filter(([_, path]) => path)
      .map(([column, path]) => {
        const found = findFieldByPath(path)
        const baseField = found ? { ...found, path } : createFallbackField(path)
        return { ...baseField, name: column } // Use column name from the existing table
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

.invalid-mapping {
  border-color: #ff6b6b;
  outline: 1px solid #ff6b6b;
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

.btn:disabled {
  background-color: #4f46e580;
  cursor: not-allowed;
}

label {
  margin-bottom: 0.25rem;
  color: white;
  display: block;
}

.required-field {
  color: #ff6b6b;
  margin-left: 3px;
  font-weight: bold;
}

.column-type {
  font-size: 0.85rem;
  color: #aaa;
  margin-left: 3px;
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

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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
