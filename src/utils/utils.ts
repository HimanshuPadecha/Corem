import { pool } from "@/db";
import { FinalColumn } from "@/types/column";

type FkeyCheck = {
  table: string;
  column: string;
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

  const response = await pool.query(query);

  console.log(response);
};
