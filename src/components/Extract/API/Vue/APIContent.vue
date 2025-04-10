<template>
  <div class="form-container">
    <URLInput v-model="url" />

    <HeaderList v-model="headers" />

    <button @click="getFormat">Get format ▶</button>

    <LoadingSpinner v-if="loadingFormat" />

    <FormatResult :visible="showContentSection" :loading="loadingFormat" :renderedKey="renderedContentKey"
      :jsonFormat="jsonFormat" :fieldTree="fieldTree" :editing="editingFields" :onLeave="onContentLeft"
      :toggleEditing="toggleFieldEditing" />

    <LoadingSpinner v-if="hasRenderedOnce && loadingFormat && !isTransitioningOut" />
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
import URLInput from '../Vue/URLInput.vue';
import HeaderList from '../Vue/HeaderList.vue';
import FormatResult from '../Vue/FormatResult.vue';
import LoadingSpinner from '../Vue/LoadingSpinner.vue';
import { useFormatLoader } from '../Scripts/ExtractSelector';
import { type Header } from '../Scripts/useHeaders';


const emit = defineEmits(['update-payload'])

const url = ref('');
const headers = ref<Header[]>([
]);

import { inject, type Ref } from 'vue'
import type { NodeData } from '../../../../shared/types/canva';
import type { Edge } from '../../../DraggableCanvas.vue';
import { defineEmits } from 'vue'

import { type ExtractConfig } from '../../Scripts/extractConfig';

const nodes = inject<Ref<NodeData[]>>('nodes')
const edges = inject<Ref<Edge[]>>('edges')

defineExpose({
  getConfig,
  setConfig
})

function getConfig() {
  const selectedFields = fieldTree.value
    ? fieldTree.value.filter(field => field.selected).map(field => field.name)
    : []

  const resolvedHeaders = Object.fromEntries(
    headers.value
      .filter(h => h.key && h.value) // skip empty headers
      .map(h => {
        let fullValue = h.value
        if (h.key === 'Authorization' && h.extra?.trim()) {
          fullValue = `${h.value} ${h.extra}` // Combine e.g., Bearer + token
        }
        return [h.key, fullValue]
      })
  )

  return {
    Fields: selectedFields,
    SourceInfo: {
      $type: 'restapi',
      Url: url.value,
      Headers: resolvedHeaders
    }
  }
}

if (!nodes || !edges) {
  throw new Error('nodes and edges must be provided by parent')
}

const {
  jsonFormat,
  fieldTree,
  loadingFormat,
  renderedContentKey,
  hasRenderedOnce,
  isTransitioningOut,
  showContentSection,
  triggerFormatLoading,
  loadFormatAfterTransition
} = useFormatLoader();

// Editing toggle
const editingFields = ref(false);
const toggleFieldEditing = () => {
  editingFields.value = !editingFields.value;
};

function setConfig(config: ExtractConfig) {
  if (!config) return;

  url.value = config.SourceInfo?.Url || '';

  const rawHeaders = config.SourceInfo?.Headers || {};
  headers.value = Object.entries(rawHeaders).map(([key, value]) => {
    if (key === 'Authorization') {
      const [prefix, ...rest] = value.split(' ');
      return {
        key,
        value: prefix,
        extra: rest.join(' ')
      };
    } else {
      return { key, value, extra: '' };
    }
  });

  const selectedFields = config.Fields || [];

  // 2. Trigger getFormat (async loads the fieldTree)
  triggerFormatLoading(url.value, headers.value);

  // 3. Watch for fieldTree to be loaded, then apply selected fields
  const stopWatch = watch(
    () => fieldTree.value,
    (tree) => {
      if (tree && tree.length > 0 && selectedFields.length > 0) {
        fieldTree.value = tree.map(field => {
          // If the field is an object, uncheck its children
          const isObject = field.children && field.children.length > 0;
          const updatedField = {
            ...field,
            selected: selectedFields.includes(field.name)
          };

          // If the field is an object, uncheck all of its children
          if (isObject && field.children) {
            updatedField.children = field.children.map(child => ({
              ...child,
              selected: false  // Uncheck all children
            }));
          }

          return updatedField;
        });

        // Optionally emit updated tree to parent
        emit('update-payload', { fieldTree: toRaw(fieldTree.value) });

        stopWatch(); // Only once
      }
    },
    { immediate: true, deep: true }
  );
}


const getFormat = () => {
  triggerFormatLoading(url.value, headers.value)

  watch(
    () => fieldTree.value,
    (newTree) => {
      if (newTree) {
        emit('update-payload', { fieldTree: toRaw(newTree) })
      }
    },
    { immediate: true, deep: true }
  )
}


const onContentLeft = () => loadFormatAfterTransition(url.value, headers.value);
</script>

<style scoped>
.form-container {
  min-width: 500px;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;
}
</style>