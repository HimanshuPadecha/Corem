import { CoremError } from "@/core/corem-error.js";
import { Column, FinalColumn } from "@/types/column.js";
import { Table } from "@/types/table.js";
import { isPrimaryKey, isTableExists } from "@/utils/utils.js";

export const tableParser = async <T extends Record<string, Column>>(
  table: Table<T>,
): Promise<string> => {
  const { name, columns } = table;

  const sqlColumns: string[] = [];

  const foreignKeys: string[] = [];

  let primaryKeyCount = 0;

  for (const [_, value] of Object.entries(columns) as [string, FinalColumn][]) {
    const { type, constraints, fkey, name: currentColumnName } = value;

    if (constraints.some((constraint) => constraint === "PRIMARY KEY")) {
      primaryKeyCount++;
    }

    if (primaryKeyCount > 1) {
      throw new CoremError({
        code: "INVALID_SCHEMA",
        message: "Two primary keys cannot be in a table",
      });
    }

    sqlColumns.push(`${currentColumnName} ${type} ${constraints.join(" ")}`);

    if (fkey) {
      const { far, onDelete } = fkey;

      if (!(await isTableExists(far.table))) {
        throw new CoremError({
          code: "NOT_FOUND",
          message: "Table not found !!",
        });
      }

      if (!(await isPrimaryKey(far))) {
        throw new CoremError({
          code: "NOT_PRIMARY_KEY",
          message: "The key is not primary key !!",
        });
      }

      let foreignKey = `FOREIGN KEY (${currentColumnName}) REFERENCES ${far.table}(${far.name}) `;

      if (onDelete) {
        foreignKey += `ON DELETE ${onDelete}`;
      }

      foreignKeys.push(foreignKey);
    }
  }

  return `CREATE TABLE IF NOT EXISTS ${name} (${sqlColumns.join(",")} ${foreignKeys.length > 0 ? "," : ""}  ${foreignKeys.join(",")});`;
};
