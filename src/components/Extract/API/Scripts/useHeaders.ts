import { ref, computed } from 'vue';
import rawHeaderConfig from '../HeaderConfig.json';


export interface Header {
  key: string;
  value: string;
  extra?: string;
}

// ✅ Define item shape — one key only, string[]
export type HeaderConfigItem = { [key: string]: string[] };

// ✅ Cast safely from unknown
const headerConfig = rawHeaderConfig as unknown as HeaderConfigItem[];

export function useHeaders() {
  const headers = ref<Header[]>([
    { key: 'Authorization', value: 'Bearer', extra: '' },
    { key: 'Accept', value: 'application/json' }
  ]);

  const availableHeaderKeys = computed<string[]>(() =>
    headerConfig.map(obj => Object.keys(obj)[0])
  );

  function getOptionsForHeader(headerKey: string): string[] {
    const found = headerConfig.find(obj => headerKey in obj);
    return found ? found[headerKey] ?? [] : [];
  }

  function isHeaderTypeDisabled(type: string, currentHeader: Header): boolean {
    return headers.value.some(h => h.key === type && h !== currentHeader);
  }

  function addHeader(): void {
    headers.value.push({ key: '', value: '', extra: '' });
  }

  function removeHeader(index: number): void {
    headers.value.splice(index, 1);
  }

  return {
    headers,
    availableHeaderKeys,
    getOptionsForHeader,
    isHeaderTypeDisabled,
    addHeader,
    removeHeader
  };
}