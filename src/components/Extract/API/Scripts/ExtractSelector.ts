import { ref } from 'vue';
import { fetchJsonWithHeaders, formatHeaders, simplifyJsonStructure } from '../../../../Shared_Scripts//fetchFormat';
import { buildFieldTreeFromJson, type FieldNode } from '../../../../Shared_Scripts/jsonTreeBuilder';

export function useFormatLoader() {
    // State
    const jsonFormat = ref('');
    const fieldTree = ref<FieldNode[]>([]);
    const loadingFormat = ref(false);
    const renderedContentKey = ref(0);
    const hasRenderedOnce = ref(false);
    const isTransitioningOut = ref(false);
    const showContentSection = ref(false);

    // Core data fetching logic
    const fetchAndProcessFormat = async (url: string, headers: any[]) => {
        const response = await fetchJsonWithHeaders(url, formatHeaders(headers));
        const simplified = simplifyJsonStructure(response);
        
        jsonFormat.value = JSON.stringify(simplified, null, 2);
        fieldTree.value = buildFieldTreeFromJson(simplified);
    };

    // Handle full format load (initial or direct)
    const loadFormatImmediately = async (url: string, headers: any[]) => {
        loadingFormat.value = true;
        showContentSection.value = true;

        try {
            await fetchAndProcessFormat(url, headers);
        } catch (error) {
            console.error('Error loading format:', error);
            showContentSection.value = false;
        } finally {
            loadingFormat.value = false;
            renderedContentKey.value++;
            hasRenderedOnce.value = true;
        }
    };

    // Handle delayed format load after animation
    const loadFormatAfterTransition = async (url: string, headers: any[]) => {
        if (!isTransitioningOut.value) return;

        loadingFormat.value = true;

        try {
            await fetchAndProcessFormat(url, headers);
        } catch (error) {
            console.error('Error loading format (post-transition):', error);
            showContentSection.value = false;
        } finally {
            loadingFormat.value = false;
            showContentSection.value = true;
            renderedContentKey.value++;
            isTransitioningOut.value = false;
        }
    };

    // Called from UI — handles conditional logic
    const triggerFormatLoading = async (url: string, headers: any[]) => {
        if (jsonFormat.value) {
            isTransitioningOut.value = true;
            showContentSection.value = false;
            return;
        }

        await loadFormatImmediately(url, headers);
    };

    return {
        jsonFormat,
        fieldTree,
        loadingFormat,
        renderedContentKey,
        hasRenderedOnce,
        isTransitioningOut,
        showContentSection,
        triggerFormatLoading,
        loadFormatAfterTransition,
    };
}
