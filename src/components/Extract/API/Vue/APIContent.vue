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
      />
  
      <LoadingSpinner
        v-if="hasRenderedOnce && loadingFormat && !isTransitioningOut"
      />
    </div>
  </template>

<script setup lang="ts">
  import { ref } from 'vue';
  import URLInput from '../Vue/URLInput.vue';
  import HeaderList from '../Vue/HeaderList.vue';
  import FormatResult from '../Vue/FormatResult.vue';
  import LoadingSpinner from '../Vue/LoadingSpinner.vue';
  import { useFormatLoader } from '../Scripts/ExtractSelector';
  import { type Header } from '../Scripts/useHeaders';
  
  const url = ref('https://api.themoviedb.org/3/movie/550?language=en-US');
const headers = ref<Header[]>([
  {
    key: 'Authorization',
    value: 'Bearer',
    extra: ''
  },
  {
    key: 'Accept',
    value: 'application/json'
  }
]);

// Format logic
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

// These now pass both arguments correctly
const getFormat = () => triggerFormatLoading(url.value, headers.value);
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
  
