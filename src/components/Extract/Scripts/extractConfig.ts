export interface ExtractConfig {
    SourceInfo: {
      $type: 'restapi' | string; // You can restrict more if needed
      Url: string;
      Headers: Record<string, string>;
    };
    Fields: string[];
    Filters: ExtractFilter[]; 
  }
  
  export interface ExtractFilter {
    Field: string;
    Operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | string; // expand as needed
    Value: string | number | boolean;
  }