<template>
  <div>
    <h3 class="title">MySQL Connection</h3>
    <form @submit.prevent="testConnection">
      <div class="form-row">
        <div class="form-group">
          <label>Server name</label>
          <input v-model="host" placeholder="e.g. 127.0.0.1" class="input" />
        </div>

        <div class="form-group">
          <label>Port</label>
          <input v-model="port" type="number" placeholder="3306" class="input" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Login</label>
          <input v-model="user" placeholder="e.g. root" class="input" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Password" class="input" />
        </div>
      </div>

      <div class="form-group">
        <label>Database</label>
        <input v-model="database" placeholder="e.g. my_database" class="input" />
      </div>

      <button type="submit" class="btn">Load Database</button>
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
      <div class="field-selector">
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
import { type LoadConfig } from '../../loadConfig';

const props = defineProps<{ fieldTree: FieldNode[] }>()

interface MappedFieldNode extends FieldNode {
  path: string
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


defineExpose({
  getConfig,
  setConfig
})

function getConfig() {
  if (!mappedTables.value.length) {
    throw new Error('No mapped tables found.')
  }

  const connectionString = `Server=${host.value};Port=${port.value};User Id=${user.value};Password=${password.value};Database=${database.value};`

  return {
    LoadTargetConfig: {
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
}

function setConfig(config: LoadConfig) {
  const info = config.TargetInfo;
  const tables = config.Tables || [];

  if (info?.ConnectionString) {
    const parts = Object.fromEntries(info.ConnectionString.split(';')
      .filter(Boolean)
      .map(part => part.split('=')));

    host.value = parts.Server || '';
    port.value = Number(parts.Port || 3306);
    user.value = parts['User Id'] || '';
    password.value = parts.Password || '';
    database.value = parts.Database || '';
  }

  loadMode.value = info?.LoadMode || 'append';
  connected.value = true;

  // Wait until fieldNodes is populated (fieldTree from props)
  const stop = watch(
    () => fieldNodes.value.length,
    (len) => {
      if (len > 0) {
        mappedTables.value = tables.map(t => ({
          name: t.TargetTable,
          fields: t.Fields.map(path => {
            const found = findFieldByPath(path);

            // fallback if field not found
            return found
              ? { ...found, path }
              : {
                  name: path.split('.').pop() || path,
                  path,
                  selected: false,
                  dataType: 'unknown',
                  rules: [],
                  ruleValues: {},
                  children: [],
                  _expanded: false
                };
          })
        }));

        stop(); // Only run once
      }
    },
    { immediate: true }
  );
}
watch(
  () => props.fieldTree,
  (newVal) => {
    if (Array.isArray(newVal)) {
      fieldNodes.value = newVal
    }
  },
  { immediate: true }
)

function testConnection() {
  connected.value = true
  tables.value = ['users', 'orders', 'products']
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
    current = level.find((n) => n.name === part)
    if (!current) return undefined
    level = current.children || []
  }

  return current
}

function flattenFields(node: FieldNode, parentPath = ''): MappedFieldNode[] {
  const path = parentPath ? `${parentPath}.${node.name}` : node.name

  if (node.children && node.children.length) {
    return node.children.flatMap((child) => flattenFields(child, path))
  }

  return [{ ...node, path }]
}

function flattenTree(tree: FieldNode[]): MappedFieldNode[] {
  return tree.flatMap((node) => flattenFields(node))
}

const allFields = computed(() => flattenTree(fieldNodes.value))

const mappedPaths = computed(() => {
  return new Set(mappedTables.value.flatMap((t) => t.fields.map((f) => f.path)))
})

const unmappedFields = computed(() =>
  allFields.value.filter((f) => !mappedPaths.value.has(f.path))
)

function confirmMapping() {
  const tableName = isCreatingNew.value ? newTableName.value : selectedTable.value
  if (!tableName) return

  const selectedFields = unmappedFields.value.filter((f) => f.selected)
  if (!selectedFields.length) return

  const alreadyMapped = mappedTables.value.find((t) => t.name === tableName)

  if (alreadyMapped) {
    const newFields = selectedFields.filter(
      (f) => !alreadyMapped.fields.find((m) => m.path === f.path)
    )
    alreadyMapped.fields.push(...newFields)
  } else {
    mappedTables.value.push({
      name: tableName,
      fields: selectedFields
    })
  }

  // Deselect after mapping
  selectedFields.forEach((f) => (f.selected = false))

  selectedTable.value = ''
  newTableName.value = ''
  isCreatingNew.value = false
}

watchEffect(() => {
  const existingPaths = new Set(allFields.value.map((f) => f.path))

  for (const table of mappedTables.value) {
    table.fields = table.fields.filter((f) => existingPaths.has(f.path))
  }

  mappedTables.value = mappedTables.value.filter((t) => t.fields.length > 0)
})

</script>

<style scoped>
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