export interface DatabaseColumn {
    columnName: string;
    dataType: string;
    isNullable: boolean;
    maxLength: number | null;
    isAutoIncrement: boolean;
  }
  
  export interface DatabaseTable {
    tableName: string;
    columns: DatabaseColumn[];
    primaryKeys: string[];
    foreignKeys: any[];
  }
  
  export interface DatabaseMetadata {
    tables: DatabaseTable[];
  }
  