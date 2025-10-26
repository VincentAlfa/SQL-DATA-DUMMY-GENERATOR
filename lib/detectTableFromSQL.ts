export interface TableInfo {
  name: string;
  defaultRecords: number;
}

export function detectTablesFromSQL(sqlSchema: string): TableInfo[] {
  const tables: TableInfo[] = [];
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/gi;

  let match;
  while ((match = tableRegex.exec(sqlSchema)) !== null) {
    tables.push({
      name: match[1],
      defaultRecords: 1,
    });
  }

  return tables;
}
