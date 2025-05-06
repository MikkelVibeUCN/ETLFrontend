export const databaseOptions = [{ label: "MySQL", value: "mysql" }];
import type { MappedFieldNode } from "./Database/MySQL/MySQLContent.vue";

export interface LoadConfig {
  TargetInfo: {
    $type: "mysql" | string; // e.g. "mysql", "postgres", "bigquery", etc.
    ConnectionString: string;
    LoadMode: "append" | "truncate" | "insert_ignore" | string;
  };
  Tables: Table[];
}

export interface Table {
  TargetTable: string;
  Fields: TableMapping[];
}

export interface TableMapping {
  TargetField: string;
  SourceField: string;
}

export function createLoadConfig(
  databaseType: string,
  loadMode: string,
  mappedTables: { name: string; fields: MappedFieldNode[] }[],
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
  extra: string = ""
): LoadConfig {
  const connectionString = `Server=${host};Port=${port};User=${user};Password=${password};Database=${database};${extra}`;

  const config: LoadConfig = {
    TargetInfo: {
      $type: databaseType,
      ConnectionString: connectionString,
      LoadMode: loadMode,
    },
    Tables: mappedTables.map((table) => ({
      TargetTable: table.name,
      Fields: table.fields.map((f) => ({
        TargetField: f.name,
        SourceField: f.path,
      })),
    })),
  };
  return config;
}
