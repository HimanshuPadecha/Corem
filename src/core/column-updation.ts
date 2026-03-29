import { getPool } from "@/db";
import { alterAddColumnParser } from "@/parser/add-coulmn";
import { Column } from "@/types/column";
import { Table } from "@/types/table";
import { logger } from "@/utils/utils";
import { RowDataPacket } from "mysql2";
import { CoremError } from "./corem-error";

export type DescTableRow = RowDataPacket & {
  Field: string;
  Type: string;
  Null: "YES" | "NO";
  Key: "PRI" | "UNI" | "MUL" | "";
  Default: string | null;
  Extra: string;
};

// this function will take all the tables schema and check if the user have add an column or not if yes this function will populate that to database;
export const tableColumnsAdditionCheck = async (
  table: Table<Record<string, Column>>,
) => {
  try {
    const { columns, name } = table;
    const pool = await getPool();

    if (!name) {
      throw new CoremError({ code: "NOT_FOUND", message: "Table does not exists" });
    }

    const [result] = await pool.query<DescTableRow[]>(`DESC ${name}`);

    const configColumns = Object.values(columns);

    const dbColumnSet: Set<string> = new Set(
      result.map((column) => column.Field),
    );

    const newColumns = configColumns.filter(
      (column) => !dbColumnSet.has(column.name),
    );

    if (newColumns.length === 0) {
      logger.info("No new Columns to add !");
      return;
    }

    const sql = await alterAddColumnParser(newColumns);
    if (!sql) {
      return;
    }

    await pool.query(sql);

    logger.success(
      `Added columns : ${newColumns.map((column) => column.name).join(" , ")}`,
    );
  } catch (error) {
    console.log(error);
  }
};
