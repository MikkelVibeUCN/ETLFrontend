// useFormatLoader.ts
import { ref } from "vue";
import { JSONFormatService } from "../../../../shared/scripts/Services/JSONFormatService";
import {
  buildFieldTreeFromJson,
  type FieldNode,
} from "../../../../shared/scripts/jsonTreeBuilder";

export function useFormatLoader() {
  // State
  const jsonFormat = ref("");
  const fieldTree = ref<FieldNode[] | null>(null);
  const loadingFormat = ref(false);
  const renderedContentKey = ref(0);
  const hasRenderedOnce = ref(false);
  const isTransitioningOut = ref(false);
  const showContentSection = ref(false);
  const formatError = ref<string | null>(null);
  
  // Core data fetching logic
  const fetchJSONFormat = async (url: string, headers: any[]) => {
    const simplified = await JSONFormatService.fetchJsonStructure(url, headers);
    jsonFormat.value = JSON.stringify(simplified, null, 2);
    fieldTree.value = buildFieldTreeFromJson(simplified);
  };
  
  // Queue for pending format requests
  let pendingFormatRequest: { url: string, headers: any[] } | null = null;
  
  // Reset state in case of error
  const resetState = () => {
    jsonFormat.value = "";
    fieldTree.value = null; // Important to reset this so watches can detect the change
  };
  
  // Handle initial format load
  const loadFormatImmediately = async (url: string, headers: any[]) => {
    loadingFormat.value = true;
    formatError.value = null;
    
    try {
      await fetchJSONFormat(url, headers);
      // Only show content after data is loaded
      showContentSection.value = true;
      renderedContentKey.value++;
      hasRenderedOnce.value = true;
    }
    catch (error: any) {
      // Reset state to ensure watches can detect the change
      resetState();
      
      // Handle error but still show the content section to display the error
      formatError.value = extractErrorMessage(error);
      showContentSection.value = true; // Still show the section to display the error
      renderedContentKey.value++;
      hasRenderedOnce.value = true;
    }
    finally {
      loadingFormat.value = false;
    }
  };
  
  // Extract meaningful error message
  const extractErrorMessage = (error: any): string => {
    let statusMessage;
    try {
      if (error?.responseBody) {
        const parsed = JSON.parse(error.responseBody);
        statusMessage = parsed?.status_message;
      }
    } catch (e) {
      statusMessage = null;
    }
    
    return statusMessage || error?.message || 'Unknown error occurred while loading format.';
  };
  
  // Handle delayed format load after transition
  const loadFormatAfterTransition = async (url: string, headers: any[]) => {
    loadingFormat.value = true;
    formatError.value = null;
    
    try {
      await fetchJSONFormat(url, headers);
      showContentSection.value = true;
      renderedContentKey.value++;
    } catch (error: any) {
      // Reset state to ensure watches can detect the change
      resetState();
      
      formatError.value = extractErrorMessage(error);
      showContentSection.value = true; // Show section to display error
      renderedContentKey.value++;
    } finally {
      loadingFormat.value = false;
      isTransitioningOut.value = false;
    }
  };
  
  // Trigger format loading with proper transition handling
  const triggerFormatLoading = async (url: string, headers: any[]) => {
    if (!hasRenderedOnce.value) {
      // First load - no transition needed
      return loadFormatImmediately(url, headers);
    }
    
    // Start transition out
    isTransitioningOut.value = true;
    showContentSection.value = false;
    
    // Store the request parameters to use after transition
    pendingFormatRequest = { url, headers };
    
    // Don't load format yet - wait for transition to complete
  };
  
  // Called by the component after transition completes
  const onTransitionComplete = async () => {
    if (pendingFormatRequest) {
      const { url, headers } = pendingFormatRequest;
      pendingFormatRequest = null;
      await loadFormatAfterTransition(url, headers);
    }
  };
  
  return {
    jsonFormat,
    fieldTree,
    loadingFormat,
    renderedContentKey,
    hasRenderedOnce,
    isTransitioningOut,
    showContentSection,
    formatError,
    triggerFormatLoading,
    loadFormatAfterTransition,
    onTransitionComplete
  };
}