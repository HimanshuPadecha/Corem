import { CoremError } from "@/core/corem-error";
import { getPool } from "@/db";
import { Column, FinalColumn } from "@/types/column";
import { CoremConfig } from "@/types/corem-config";
import { Table } from "@/types/table";
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

type HaveFkeyRow = RowDataPacket & {
  have_fkey: number;
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

export const getDbTables = async () => {
  const pool = await getPool();
  let dbTables: string[] = [];

  const [rows] = await pool.query<RowDataPacket[]>("SHOW TABLES;");

  rows.forEach((row) => dbTables.push(Object.values(row)[0] as string));

  return dbTables;
};

export const isTableExists = async (name: string) => {
  const tables = await getDbTables();

  const tableSet: Set<string> = new Set(tables);

  return tableSet.has(name);
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

export const getUserSchema = async (coremConfig: CoremConfig) => {
  const { schema: schemaPath } = coremConfig;

  const root = process.cwd();

  const schema = await import(path.resolve(root, schemaPath));

  const tables: Table<Record<string, Column>>[] = [];

  for (const [_, table] of Object.entries(schema) as unknown as [
    string,
    Table<Record<string, Column>>,
  ][]) {
    tables.push(table);
  }

  return tables;
};

export const getTablesWithoutForeignKeys = (
  tables: Table<Record<string, Column>>[],
) => {
  return tables.filter((table) => {
    if (!table?.columns) return false; // 🔥 guard

    return Object.values(table.columns).every((col) => !col?.fkey);
  });
};

export const getTablesWithForeignKeys = (
  tables: Table<Record<string, Column>>[],
) => {
  return tables.filter((table) => {
    if (!table?.columns) return false; // 🔥 guard

    return Object.values(table.columns).some((col) => col?.fkey);
  });
};

type Partition = { withForeignKeys: string[]; withoutForeignKeys: string[] };

// This function devide tables in to tables with foreign keys and without foreign keys
// so that we can delete tables with foreign keys first
export const tablePartitionsToDeleteThem = async (
  tables: string[],
): Promise<Partition> => {
  const coremConfig = await getConfig();

  const buildQuery = (name: string) => `SELECT 1 AS "have_fkey"
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${coremConfig.credentials.db_name}'
      AND TABLE_NAME = '${name}'
      AND REFERENCED_TABLE_NAME IS NOT NULL
      LIMIT 1;`;

  const pool = await getPool();

  const result: Partition = { withForeignKeys: [], withoutForeignKeys: [] };

  for (const table of tables) {
    const query = buildQuery(table);

    const [rows] = await pool.query<HaveFkeyRow[]>(query);

    const exists = rows[0]?.have_fkey === 1;
    if (exists) {
      result.withForeignKeys.push(table);
    } else {
      result.withoutForeignKeys.push(table);
    }
  }

  return result;
};

export const logger = {
  info: (msg: string) => console.log(`ℹ️  ${msg} \n`),
  success: (msg: string) => console.log(`✅ ${msg} \n`),
  error: (msg: string) => console.error(`❌ ${msg}\n`),
  step: (msg: string) => console.log(`🚀 ${msg}\n`),
};
