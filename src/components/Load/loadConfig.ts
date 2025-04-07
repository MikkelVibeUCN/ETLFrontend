export const databaseOptions = [
  { label: 'MySQL', value: 'mysql' }
]

export interface LoadConfig {
  LoadTargetConfig: {
    TargetInfo: {
      $type: 'mysql'| string; // e.g. "mysql", "postgres", "bigquery", etc.
      ConnectionString: string;
      LoadMode: "append" | "truncate" | "insert_ignore" | string;
    };
    Tables: TargetTable[];
  };
}

export interface TargetTable {
  TargetTable: string;
  Fields: string[];
}
