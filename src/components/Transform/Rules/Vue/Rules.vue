<template>
  <div class="rules-container">
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
          <div class="rules-list">
            <div
              v-for="(rule, i) in node.rules || []"
              :key="rule + i"
              class="rule-row"
            >
              <span class="rule-label">
                {{ getRuleDefinition(rule)?.label || rule }}
              </span>

              <!-- Input types -->
              <template v-if="getInputDefinition(rule, node.dataType)">
                <select
                  v-if="getInputDefinition(rule, node.dataType)?.inputType === 'select'"
                  v-model="getRuleValue(node, rule).value"
                  class="rule-input"
                >
                  <option
                    v-for="opt in getInputDefinition(rule, node.dataType)?.options || []"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>

                <input
                  v-else-if="getInputDefinition(rule, node.dataType)?.inputType === 'text'"
                  v-model="getRuleValue(node, rule).value"
                  type="text"
                  class="rule-input"
                />

                <input
                  v-else-if="getInputDefinition(rule, node.dataType)?.inputType === 'number'"
                  v-model.number="getRuleValue(node, rule).value"
                  type="number"
                  class="rule-input"
                />

                <input
                  v-else-if="getInputDefinition(rule, node.dataType)?.inputType === 'checkbox'"
                  v-model="getRuleValue(node, rule).value"
                  type="checkbox"
                />
              </template>

              <button class="remove-btn" @click="removeRule(node, i)">✕</button>
            </div>

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

          <div v-if="node.children?.length" class="child-section">
            <Rules :nodes="node.children" @update="emitChange" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue'
import ruleConfig from '../Scripts/ruleConfig'
import { type FieldNode } from '../../../../shared/scripts/jsonTreeBuilder';



const props = defineProps<{ nodes: FieldNode[] }>()
const emit = defineEmits(['update'])

const newRule = ref<Record<string, string>>({})

function emitChange() {
  emit('update', props.nodes)
}

function toggle(node: FieldNode) {
  node._expanded = !node._expanded
}

function getRuleDefinition(ruleKey: string) {
  return ruleConfig.ruleDefinitions[ruleKey]
}

function getRuleOptionsFor(node: FieldNode): string[] {
  const baseRules = ruleConfig.typeRules[node.dataType || 'string'] || []
  return [...new Set([...baseRules, ...ruleConfig.globalRules])]
}

function getInputDefinition(ruleKey: string, dataType: string) {
  const def = ruleConfig.ruleDefinitions[ruleKey]
  return def?.inputTypeByDataType?.[dataType] || def
}

// Two-way binding for a rule value
function getRuleValue(node: FieldNode, rule: string) {
  const key = `${node.name}_${rule}`
  if (!node.ruleValues) node.ruleValues = {}

  return computed({
    get: () => node.ruleValues![key],
    set: (val) => {
      node.ruleValues![key] = val
      emitChange()
    }
  })
}

function addRule(node: FieldNode) {
  const rule = newRule.value[node.name]
  if (!rule) return

  if (!node.rules) node.rules = []
  if (!node.ruleValues) node.ruleValues = {}

  if (node.rules.includes(rule)) return

  node.rules.push(rule)
  newRule.value[node.name] = ''

  const def = getInputDefinition(rule, node.dataType)
  if (def?.defaultValue !== undefined) {
    let value = def.defaultValue
    if (value === '$fieldName') value = node.name
    node.ruleValues[`${node.name}_${rule}`] = value
  }

  emitChange()
}

function removeRule(node: FieldNode, index: number) {
  if (!node.rules) return
  const removed = node.rules.splice(index, 1)[0]
  if (removed && node.ruleValues) {
    delete node.ruleValues[`${node.name}_${removed}`]
  }
  emitChange()
}

onMounted(() => {
  const init = (nodes: FieldNode[]) => {
    nodes.forEach(n => {
      if (!n.ruleValues) n.ruleValues = {}
      if (!n.rules) n.rules = []
      n._expanded = false
      if (n.children?.length) init(n.children)
    })
  }
  init(props.nodes)
})

defineExpose({
  getConfig
})

function getConfig() {
  const mappings: { SourceField: string; TargetField: string }[] = []
  const filters: { Field: string; Operator: string; Value: string }[] = []

  const ruleDefs = ruleConfig.ruleDefinitions

  const walk = (nodes: FieldNode[]) => {
    for (const node of nodes) {
      if (!node.selected) continue

      const rules = node.rules || []

      for (const ruleKey of rules) {
        const fullKey = `${node.name}_${ruleKey}`
        const def = ruleDefs[ruleKey]
        const rawVal = node.ruleValues?.[fullKey]
        const val = rawVal?.value ?? rawVal // support reactive or plain

        if (val === undefined || val === null || val === '') continue

        // If rule has defaultValue = $fieldName, treat as a mapping rule
        if (def?.defaultValue === '$fieldName') {
          mappings.push({
            SourceField: node.name,
            TargetField: val.toString()
          })
        } else {
          filters.push({
            Field: node.name,
            Operator: ruleKey,
            Value: val.toString()
          })
        }
      }

      if (node.children?.length) {
        walk(node.children)
      }
    }
  }

  walk(props.nodes)

  return {
    Mappings: mappings,
    Filters: filters
  }
}

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

.rule-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #2e2e2e;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px #3a3a3a;
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

.child-section {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px dashed #444;
}
</style>
