import { CoremError } from "@/core/corem-error";
import { Column } from "@/types/column";
import { Table } from "@/types/table";

export const tableParser = <T extends Record<string, Column>>(
  table: Table<T>,
): string => {
  const { name, columns } = table;

  const sqlColumns: string[] = [];

  const foreignKeys: string[] = [];

  let primaryKeyCount = 0;

  for (const [key, value] of Object.entries(columns)) {
    const { type, constraints, fkey } = value;

    if (constraints.some((constraint) => constraint === "PRIMARY KEY")) {
      primaryKeyCount++;
    }

    if (primaryKeyCount > 1) {
      throw new CoremError({
        code: "INVALID SCHEMA",
        message: "Two primary keys cannot be in a table",
      });
    }

    sqlColumns.push(`${key} ${type} ${constraints.join(" ")}`);

    if (fkey) {
      const { far, onDelete } = fkey;
      
      
    }
  }

  return `CREATE TABLE IF NOT EXISTS ${name} (${sqlColumns.join(",")});`;
};
