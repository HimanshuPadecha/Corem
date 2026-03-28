import { pool } from "@/db";
import { FinalColumn } from "@/types/column";
import { RowDataPacket } from "mysql2";

type FkeyCheck = {
  table: string;
  column: string;
};

type PrimaryKeyCountRow = RowDataPacket & {
  is_primary: number;
};

const fkeyCheckQuery = ({ table, column }: FkeyCheck) => {
  return `SELECT COUNT(*) AS is_primary
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = "${table}"
        AND COLUMN_NAME = "${column}"
        AND CONSTRAINT_NAME = 'PRIMARY';`;
};

export const isForeignKey = async (column: FinalColumn) => {
  const query = fkeyCheckQuery({ table: column.table, column: column.name });

  const [rows] = await pool.query<PrimaryKeyCountRow[]>(query);
  const response = rows[0];

  return response?.is_primary ?? 0;
};


export class Console {
  static log(query : any){
    console.log(
      "-----------------------------------------------------------------------------------\n\n" +
        query +
        "\n\n-------------------------------------------------------------------------------------",
    );
  }
}