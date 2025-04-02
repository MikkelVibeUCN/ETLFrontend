<template>
  <div class="rules-container">
    <!-- Show rule nodes if available -->
    <template v-if="nodes && nodes.length">
      <div
        v-for="(node, index) in nodes"
        :key="node.name + index"
        class="rule-node"
      >
        <div class="dropdown-header" @click="toggle(node)">
          <span>{{ node.name }}</span>
          <span class="chevron">{{ node._expanded ? '▾' : '▸' }}</span>
        </div>

        <div v-if="node._expanded" class="dropdown-content">
          <!-- Rule picker -->
          <div class="rules-list">
            <!-- Existing rules -->
            <div
              v-for="(rule, i) in node.rules || []"
              :key="rule + i"
              class="rule-row"
            >
              <span class="rule-label">
                {{ getRuleDefinition(rule)?.label || rule }}
              </span>

              <!-- Dynamic rule input, driven by config -->
              <template v-if="getInputDefinition(rule, node.dataType)">
                <select
                  v-if="
                    getInputDefinition(rule, node.dataType)?.inputType ===
                    'select'
                  "
                  v-model="ruleValues[node.name + '_' + rule]"
                  class="rule-input"
                >
                  <option
                    v-for="opt in getInputDefinition(rule, node.dataType)
                      ?.options || []"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>

                <input
                  v-else-if="
                    getInputDefinition(rule, node.dataType)?.inputType ===
                    'text'
                  "
                  v-model="ruleValues[node.name + '_' + rule]"
                  type="text"
                  class="rule-input"
                />

                <input
                  v-else-if="
                    getInputDefinition(rule, node.dataType)?.inputType ===
                    'number'
                  "
                  v-model.number="ruleValues[node.name + '_' + rule]"
                  type="number"
                  class="rule-input"
                />

                <input
                  v-else-if="
                    getInputDefinition(rule, node.dataType)?.inputType ===
                    'checkbox'
                  "
                  v-model="ruleValues[node.name + '_' + rule]"
                  type="checkbox"
                />
              </template>

              <button class="remove-btn" @click="removeRule(node, i)">
                ✕
              </button>
            </div>

            <!-- Add new rule -->
            <div class="add-row">
              <select v-model="newRule[node.name]">
                <option disabled value="">Select rule</option>
                <option
                  v-for="option in getRuleOptionsFor(node)"
                  :key="option"
                  :value="option"
                >
                  {{ getRuleDefinition(option)?.label || option }}
                </option>
              </select>
              <button @click="addRule(node)">Add +</button>
            </div>
          </div>

          <!-- Recursive children -->
          <div v-if="node.children?.length" class="child-section">
            <Rules :nodes="node.children" @update="emitChange" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>


<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from 'vue'

interface FieldNode {
  name: string
  selected: boolean
  dataType: string // ✅ Add this line
  rule?: string
  rules?: string[]
  children?: FieldNode[]
  _expanded?: boolean
}

const props = defineProps<{
  nodes: FieldNode[]
}>()

const emit = defineEmits(['update'])

function emitChange() {
  emit('update', props.nodes)
}

const ruleValues = ref<Record<string, any>>({})


import ruleConfig from '../Scripts/ruleConfig'
import DefaultContent from './DefaultContent.vue'

function getRuleOptionsFor(node: FieldNode): string[] {
  const baseRules = ruleConfig.typeRules[(node as any).dataType || 'string'] || []
  const allRules = [...new Set([...baseRules, ...ruleConfig.globalRules])]
  return allRules
}

function getRuleDefinition(ruleKey: string) {
  return ruleConfig.ruleDefinitions[ruleKey]
}
const newRule = ref<Record<string, string>>({})

function toggle(node: FieldNode) {
  node._expanded = !node._expanded
}

function addRule(node: FieldNode) {
  const rule = newRule.value[node.name]
  if (!rule) return
  if (!node.rules) node.rules = []
  if (node.rules.includes(rule)) return

  node.rules.push(rule)
  newRule.value[node.name] = ''

  // ✅ Check if rule has a defaultValue
  const ruleDef = getInputDefinition(rule, node.dataType)
  if (ruleDef?.defaultValue !== undefined) {
    let value = ruleDef.defaultValue

    // Support special keyword
    if (typeof value === 'string' && value === '$fieldName') {
      value = node.name
    }
    ruleValues.value[node.name + '_' + rule] = value
  }
  emitChange()
}

function getInputDefinition(ruleKey: string, dataType: string) {
  const def = ruleConfig.ruleDefinitions[ruleKey]
  if (!def) return null

  if (def.inputTypeByDataType?.[dataType]) {
    return def.inputTypeByDataType[dataType]
  }

  return def
}


function removeRule(node: FieldNode, index: number) {
  node.rules?.splice(index, 1)
  emitChange()
}

onMounted(() => {
  props.nodes.forEach(n => (n._expanded = false))
})
</script>

<style scoped>
.rules-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: #1e1e1e;
  color: #f0f0f0;
  padding: 1rem;
  border-radius: 12px;
  width: auto;
  
}

.rule-node {
  border: 1px solid #444;
  border-radius: 10px;
  overflow: hidden;
  gap: 0.75rem;
  background-color: #2a2a2a;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  border-bottom: 1px solid #444;
}

.chevron {
  font-size: 1.2rem;
  color: #bbb;
}

.dropdown-content {
  background-color: #1e1e1e;
  padding: 1rem;
  border-top: 1px solid #444;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Rule Rows */
.rule-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #2e2e2e;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px #3a3a3a;
  transition: background-color 0.2s ease;
}

.rule-row:hover {
  background-color: #353535;
}

.rule-label {
  min-width: 120px;
  font-weight: 500;
  color: #f0f0f0;
  font-size: 0.95rem;
}

.rule-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background-color: #1e1e1e;
  border: 1px solid #555;
  color: #f0f0f0;
  font-size: 0.95rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #f55;
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.remove-btn:hover {
  transform: scale(1.2);
}

/* Add Rule */
.add-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-items: center;
}

.add-row select {
  background-color: #2e2e2e;
  color: #f0f0f0;
  border: 1px solid #555;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  flex: 1;
  font-size: 0.95rem;
}

.add-row button {
  background-color: #444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.add-row button:hover {
  background-color: #555;
}

/* Children Recursion Section */
.child-section {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px dashed #444;
}
.empty-state {
  padding: 2rem;
  text-align: center;
  border: 2px dashed #444;
  border-radius: 10px;
  background-color: #1a1a1a;
  color: #ccc;

  margin: 2rem auto;
  width: auto;
}
</style>