import { CoremError } from "@/core/corem-error.js";
import { FinalColumn } from "@/types/column.js";
import { isPrimaryKey, isTableExists  } from "@/utils/utils.js";

export const alterAddColumnParser = async (
  columns: FinalColumn[],
): Promise<string> => {

  const sqlColumns: string[] = [];
  const foreignKeys: string[] = [];

  const { table } = columns[0]!;

  let sql = `ALTER TABLE ${table} `;

  for (const column of columns) {
    const { constraints, name: currentCol, type, fkey } = column;
    sqlColumns.push(
      `ADD COLUMN ${currentCol} ${type} ${constraints.join(" ")}`,
    );

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

      let sql = `ADD CONSTRAINT fk_${far.table} FOREIGN KEY (${currentCol}) REFERENCES ${far.table}(${far.name}) `;

      if (onDelete) {
        sql += `ON DELETE ${onDelete}`;
      }

      foreignKeys.push(sql);
    }
  }

  return `${sql}${sqlColumns.join(",")} ${foreignKeys.length > 0 ? "," : ""} ${foreignKeys.join(",")};`;
};

export const alterRemoveColumnParser = ({
  table,
  columns,
}: {
  table: string;
  columns: string[];
}) => {
  return `ALTER TABLE ${table} ${columns.map((column) => `DROP COLUMN ${column}`).join(",")}`;
};
