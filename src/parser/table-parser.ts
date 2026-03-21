import { Column } from "../types/column";
import { Table } from "../types/table";

export const tableParser = <T extends Record<string, Column>>(
  table: Table<T>,
) => {
  const { name, columns } = table;

  let sqlColumns = "";

  for (const [key, value] of Object.entries(columns)) {
    const { type, constraints } = value;
    sqlColumns += `${key} : ${type} ${constraints.join(" ")},\n`;
  }

  return `CREATE TABLE ${name} IF NOT EXISTS (\n${sqlColumns});`;
};
