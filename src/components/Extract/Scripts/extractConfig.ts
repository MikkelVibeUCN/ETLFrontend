export interface ExtractConfig {
    SourceInfo: {
      $type: 'api' | string; // You can restrict more if needed
      Url: string;
      Headers: Record<string, string>;
    };
    Fields: string[];
    Filters: ExtractFilter[]; // You mentioned it but didn't use Filters; included for completeness
  }
  
  export interface ExtractFilter {
    Field: string;
    Operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | string; // expand as needed
    Value: string | number | boolean;
  }