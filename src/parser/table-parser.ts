import { Column } from "../types/column";
import { Table } from "../types/table";

export const tableParser = <T extends Record<string, Column>>(
  table: Table<T>,
) => {
  const { name, columns } = table;

  let sqlColumns = [];

  for (const [key, value] of Object.entries(columns)) {
    const { type, constraints } = value;
    sqlColumns.push(`${key} ${type} ${constraints.join(" ")}`);
  }

  return `CREATE TABLE IF NOT EXISTS ${name} (${sqlColumns.join(",")});`;
};
