import { CoremError } from "@/core/corem-error";
import { getPool } from "@/db";
import { FinalColumn } from "@/types/column";
import { CoremConfig } from "@/types/corem-config";
import fs from "fs";
import { RowDataPacket } from "mysql2";
import path from "path";

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
  const pool = await getPool();
  const query = fkeyCheckQuery({ table: column.table, column: column.name });

  const [rows] = await pool.query<PrimaryKeyCountRow[]>(query);
  const response = rows[0];

  return response?.is_primary ?? 0;
};

export class Console {
  static log(query: any) {
    console.log(
      "-----------------------------------------------------------------------------------\n\n" +
        query +
        "\n\n-------------------------------------------------------------------------------------",
    );
  }
}

export const getConfig = async (): Promise<CoremConfig> => {
  const root = process.cwd();

  if (!fs.existsSync(path.join(root, "corem.config.ts"))) {
    throw new CoremError({
      code: "NOT_FOUND",
      message: "Config not found",
    });
  }

  const coremCongig = (await import(path.join(root, "corem.config.ts")))
    .default as CoremConfig;

  validateConfig(coremCongig);

  return coremCongig;
};

const validateConfig = (coremConfig: CoremConfig) => {
  const { credentials, schema } = coremConfig;

  const root = process.cwd();

  if (!schema || !credentials) {
    throw new CoremError({
      code: "NOT_FOUND",
      message: "Schema or credentials not found !!",
    });
  }

  if (!fs.existsSync(path.join(root, schema))) {
    throw new CoremError({
      code: "NOT_FOUND",
      message: "Schema file not found ",
    });
  }

  const { db_name, host, password, user } = credentials;

  if (!db_name || !host || !password || !user) {
    throw new CoremError({
      code: "NOT_FOUND",
      message: "Credentials not found",
    });
  }
};


export const logger = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  step: (msg: string) => console.log(`🚀 ${msg}`),
};