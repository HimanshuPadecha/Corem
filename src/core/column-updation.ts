import { getPool } from "@/db";
import {
  alterAddColumnParser,
  alterRemoveColumnParser,
} from "@/parser/column-parser";
import { Column } from "@/types/column";
import { Table } from "@/types/table";
import { dropForeignKeyConstraintIfExists, logger } from "@/utils/utils";
import { RowDataPacket } from "mysql2";

export type DescTableRow = RowDataPacket & {
  Field: string;
  Type: string;
  Null: "YES" | "NO";
  Key: "PRI" | "UNI" | "MUL" | "";
  Default: string | null;
  Extra: string;
};

// This function will get the table that have the columns to add to that table
export const tableColumnsAddition = async (
  table: Table<Record<string, Column>>,
) => {
  try {
    const { columns } = table;
    const pool = await getPool();

    const newColumns = Object.values(columns);

    const sql = await alterAddColumnParser(newColumns);

    await pool.query(sql);

    logger.success(
      `Added columns : ${newColumns.map((column) => column.name).join(" , ")}`,
    );
  } catch (error) {
    console.log(error);
  }
};

export const tableColumnsDeletion = async (
  table: Table<Record<string, Column>>,
) => {
  try {
    const pool = await getPool();
    const { name, columns } = table;

    const [result] = await pool.query<DescTableRow[]>(`DESC ${name}`);

    const dbColumns = result.map((column) => column.Field);
    const configColumnsSet: Set<string> = new Set(
      Object.values(columns).map((column) => column.name),
    );

    const columnsToRemove = dbColumns.filter(
      (column) => !configColumnsSet.has(column),
    );

    await Promise.all(
      columnsToRemove.map((column) =>
        dropForeignKeyConstraintIfExists({ column, table: name }),
      ),
    );

    const sql = alterRemoveColumnParser({
      table: name,
      columns: columnsToRemove,
    });

    await pool.query(sql);

    logger.success(`Columns removed ${columnsToRemove.join(",")}`);
  } catch (error) {
    console.log(error);
  }
};
