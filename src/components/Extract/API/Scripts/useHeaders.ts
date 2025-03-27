import { ref, computed } from 'vue';

// Define the header structure
export interface Header {
  key: string;
  value: string;
  extra?: string;
}

type HeaderTypes = {
  [key: string]: string[];
};

export function useHeaders() {
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

  const headerTypes: HeaderTypes[] = [
    {
      'Content-Type': [
        'application/json',
        'application/xml',
        'application/x-www-form-urlencoded',
        'application/form-data',
        'text/html',
        'text/css',
        'text/csv'
      ]
    },
    {
      Authorization: ['Bearer', 'Basic']
    },
    {
      Accept: ['application/json']
    }
  ];

  const availableHeaderKeys = computed<string[]>(() =>
    headerTypes.map(obj => Object.keys(obj)[0])
  );

  function getOptionsForHeader(headerKey: string): string[] {
    const found = headerTypes.find(obj =>
      Object.prototype.hasOwnProperty.call(obj, headerKey)
    );

    if (found) {
      const record = found as Record<string, string[]>;
      return record[headerKey] ?? [];
    }

    return [];
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
