export interface database {
    tables: dbTable[]
}

export interface dbTable {
    tableName: string,
    columns: string[],
    primaryKeys: string[],
    foreignKeys: string[]
}