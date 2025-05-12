import { computed } from 'vue';
import rawHeaderConfig from '../HeaderConfig.json';

export interface Header {
  key: string;
  value: string;
  extra?: string;
}

export type HeaderConfigItem = { [key: string]: string[] };

const headerConfig = rawHeaderConfig as unknown as HeaderConfigItem[];

export function useHeaders(headers: Header[]) {

  const availableHeaderKeys = computed<string[]>(() =>
    headerConfig.map(obj => Object.keys(obj)[0])
  );

  function getOptionsForHeader(headerKey: string): string[] {
    const found = headerConfig.find(obj => headerKey in obj);
    return found ? found[headerKey] ?? [] : [];
  }

  function isHeaderTypeDisabled(type: string, currentHeader: Header): boolean {
    return headers.some(h => h.key === type && h !== currentHeader);
  }

  function addHeader(): void {
    headers.push({ key: '', value: '', extra: '' });
  }

  function removeHeader(index: number): void {
    headers.splice(index, 1);
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