export const formatSQLOutput = (sqlText: string): string => {
  let formatted = sqlText.trim();
  formatted = formatted.replace(/^```sql\s*/i, '');
  formatted = formatted.replace(/\s*```\s*$/, '');
  formatted = formatted.trim();

  const statements = formatted.split(/(?=INSERT INTO)/gi);

  return statements
    .map((statement) => {
      if (!statement.trim()) return '';

      let formattedStatement = statement;

      formattedStatement = formattedStatement.replace(/INSERT\s+INTO\s+(\w+)/gi, 'INSERT INTO $1');

      formattedStatement = formattedStatement.replace(/VALUES\s*\(/gi, '\nVALUES\n  (');

      formattedStatement = formattedStatement.replace(/\),\s*\(/g, '),\n  (');

      formattedStatement = formattedStatement.replace(/\);\s*$/, ');\n');

      return formattedStatement.trim();
    })
    .filter((s) => s)
    .join('\n\n');
};
