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

export const tableColumnsDeletion = async (table: {
  name: string;
  columns: string[];
}) => {
  try {
    const pool = await getPool();
    const { name, columns } = table;

    const sql = alterRemoveColumnParser({
      table: name,
      columns,
    });

    await pool.query(sql);

    logger.success(`Columns removed : ${columns.join(",")}`);
  } catch (error) {
    console.log(error);
  }
};
