<template>
  <div class="form-container">
    <URLInput v-model="url" />

    <HeaderList v-model="headers" />

    <button @click="getFormat">Get format ▶</button>

    <LoadingSpinner v-if="loadingFormat" />

    <FormatResult 
      :visible="showContentSection" 
      :loading="loadingFormat" 
      :renderedKey="renderedContentKey"
      :jsonFormat="jsonFormat" 
      :fieldTree="fieldTree" 
      :editing="editingFields" 
      :onLeave="onContentLeft"
      :toggleEditing="toggleFieldEditing" 
      :error="formatError" />

    <LoadingSpinner v-if="hasRenderedOnce && loadingFormat && !isTransitioningOut" />
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch, onMounted } from 'vue';
import URLInput from '../Vue/URLInput.vue';
import HeaderList from '../Vue/HeaderList.vue';
import FormatResult from '../Vue/FormatResult.vue';
import LoadingSpinner from '../Vue/LoadingSpinner.vue';
import { useFormatLoader } from '../Scripts/ExtractSelector';
import { type Header } from '../Scripts/useHeaders';

import { inject, type Ref } from 'vue'
import type { NodeData } from '../../../../shared/types/canva';
import type { Edge } from '../../../DraggableCanvas.vue';
import { defineEmits } from 'vue'

import { type ExtractConfig } from '../../Scripts/extractConfig';

const emit = defineEmits(['update-payload', 'component-ready'])

const url = ref('');
const headers = ref<Header[]>([]);
let pendingSelectedFields: string[] = [];

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
  formatError,
  triggerFormatLoading,
  onTransitionComplete
} = useFormatLoader();

// Editing toggle
const editingFields = ref(false);
const toggleFieldEditing = () => {
  editingFields.value = !editingFields.value;
};

// Fixed function to avoid TDZ issue
async function setConfig(config: ExtractConfig) {
  console.log('[APIContent] setConfig called with:', config);
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

  // Store selected fields for later use
  pendingSelectedFields = config.Fields || [];
  
  console.log('[APIContent] Stored pending fields:', pendingSelectedFields);
  
  // Trigger format loading
  await triggerFormatLoading(url.value, headers.value);
}

// Create a separate watcher function to avoid temporal dead zone issues
let selectedFieldsWatcher: ReturnType<typeof watch> | null = null;

// Watch fieldTree changes and apply selected fields when available
watch(
  () => fieldTree.value,
  (tree) => {
    if (tree && tree.length > 0 && pendingSelectedFields.length > 0) {
      console.log('[APIContent] FieldTree loaded, applying pending fields:', pendingSelectedFields);
      
      fieldTree.value = tree.map(field => {
        const isObject = field.children && field.children.length > 0;
        const updatedField = {
          ...field,
          selected: pendingSelectedFields.includes(field.name)
        };

        if (isObject && field.children) {
          updatedField.children = field.children.map(child => ({
            ...child,
            selected: false // Uncheck all children
          }));
        }

        return updatedField;
      });

      // Clear pending fields after applying
      pendingSelectedFields = [];
      
      // Emit updated fieldTree to parent
      emit('update-payload', { fieldTree: toRaw(fieldTree.value) });
    }
  },
  { deep: true }
);

const getFormat = async () => {
  try {
    await triggerFormatLoading(url.value, headers.value);
  } catch (err: any) {
    console.error('Error loading format:', err);
  }
};

// General watcher for fieldTree updates
watch(
  () => fieldTree.value,
  (newTree) => {
    if (newTree) {
      console.log('[APIContent] fieldTree updated:', toRaw(newTree));
      emit('update-payload', { fieldTree: toRaw(newTree) });
    } else {
      console.log('[APIContent] fieldTree reset to null');
      emit('update-payload', { fieldTree: [] });
    }
  },
  { deep: true }
);

const onContentLeft = () => {
  onTransitionComplete();
};

// Signal that component is ready when mounted
onMounted(() => {
  console.log('[APIContent] Component mounted and ready');
  emit('component-ready');
});
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