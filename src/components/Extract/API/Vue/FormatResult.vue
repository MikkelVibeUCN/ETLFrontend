<template>
  <transition name="fade-up" @after-leave="handleAfterLeave">
    <div v-if="visible" :key="renderedKey" class="content">
      <div v-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
      </div>
      <div v-else>
        <div class="labels-row">
          <label class="section-label">JSON Format</label>
          <label class="section-label">Include Fields</label>
        </div>
        <div class="content-row">
          <div class="section">
            <textarea v-model="jsonFormatModel" rows="10" />
          </div>
          <div class="section">
            <button @click="toggleEditing">
              {{ editing ? 'Hide' : 'Edit' }}
            </button>
            <div v-if="editing" style="margin-top: 1rem;">
              <TreeCheckbox :nodes="fieldTree" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TreeCheckbox from './TreeCheckbox.vue';

const props = defineProps<{
  jsonFormat: string;
  fieldTree: any;
  editing: boolean;
  visible: boolean;
  loading: boolean;
  renderedKey: number;
  onLeave: () => void;
  toggleEditing: () => void;
  error?: string | null
}>();

const emit = defineEmits(['update:jsonFormat']);

const jsonFormatModel = computed({
  get: () => props.jsonFormat,
  set: (val: string) => emit('update:jsonFormat', val)
});

const handleAfterLeave = () => {
  props.onLeave();
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.labels-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
}

.section-label {
  width: 50%;
  font-weight: bold;
}

.content-row {
  display: flex;
  gap: 1rem;
}

.section {
  width: 50%;
  display: flex;
  flex-direction: column;
}

textarea {
  flex: 1;
  height: 200px;
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
}

.checkboxes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.error-container {
  width: 100%;
}

.error-message {
  color: #ff4d4f;
  background-color: #2b1b1b;
  padding: 0.75rem;
  border: 1px solid #ff4d4f;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* Transition animation */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>