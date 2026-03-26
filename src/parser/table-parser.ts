import { CoremError } from "@/core/corem-error";
import { Column, FinalColumn } from "@/types/column";
import { Table } from "@/types/table";
import { isForeignKey } from "@/utils/utils";

export const tableParser = <T extends Record<string, Column>>(
  table: Table<T>,
): string => {
  const { name, columns } = table;

  const sqlColumns: string[] = [];

  const foreignKeys: string[] = [];

  let primaryKeyCount = 0;

  for (const [key, value] of Object.entries(columns) as [
    string,
    FinalColumn,
  ][]) {
    const { type, constraints, fkey, name: currentColumnName } = value;

    if (constraints.some((constraint) => constraint === "PRIMARY KEY")) {
      primaryKeyCount++;
    }

    if (primaryKeyCount > 1) {
      throw new CoremError({
        code: "INVALID SCHEMA",
        message: "Two primary keys cannot be in a table",
      });
    }

    sqlColumns.push(`${currentColumnName} ${type} ${constraints.join(" ")}`);

    if (fkey) {
      const { far, onDelete } = fkey;

      if (!isForeignKey(far)) {
        throw new CoremError({
          code: "NOT PRIMARY KEY",
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
