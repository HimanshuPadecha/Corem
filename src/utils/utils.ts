import { DescTableRow } from "@/core/column-updation.js";
import { DbConstraintsOutput } from "@/core/constraints-updation.js";
import { CoremError } from "@/core/corem-error.js";
import { getPool } from "@/db/index.js";
import { Column, FinalColumn } from "@/types/column.js";
import { Constraint } from "@/types/constraints.js";
import { CoremConfig } from "@/types/corem-config.js";
import { Table } from "@/types/table.js";
import fs from "fs";
import { RowDataPacket } from "mysql2";
import path from "path";
import { createJiti } from "jiti";
import { jiti } from "./jiti.js";

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

export const isPrimaryKey = async (column: FinalColumn) => {
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

  const coremConfig = (await jiti.import(
    path.join(root, "corem.config.ts"),
  )) as CoremConfig;

  validateConfig(coremConfig);

  return coremConfig;
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

  // if (!db_name || !host || !password || !user) {
  //   throw new CoremError({
  //     code: "NOT_FOUND",
  //     message: "Credentials not found",
  //   });
  // }

  if (
    db_name == null ||
    host == null ||
    user == null ||
    password == null
  ) {
    throw new CoremError({
      code: "NOT_FOUND",
      message: "Credentials not found",
    });
  }
};

export const getUserSchema = async (coremConfig: CoremConfig) => {
  const { schema: schemaPath } = coremConfig;

  const root = process.cwd();

  const imported = await jiti.import(path.resolve(root, schemaPath));

  if (imported == null || typeof imported !== "object") {
    return null;
  }

  const schema = imported as Record<string, unknown>;

  const values = Object.values(schema);

  const isEmpty = values.every(
    (val) =>
      val == null || (typeof val === "object" && Object.keys(val).length === 0),
  );

  if (isEmpty) {
    return null;
  }

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
    if (!table?.columns) return false;

    return Object.values(table.columns).every((col) => !col?.fkey);
  });
};

export const getTablesWithForeignKeys = (
  tables: Table<Record<string, Column>>[],
) => {
  return tables.filter((table) => {
    if (!table?.columns) return false;

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

type fkeyCheckResult = RowDataPacket & {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  CONSTRAINT_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
};

export const dropForeignKeyConstraintIfExists = async ({
  table,
  column,
}: {
  table: string;
  column: string;
}) => {
  const pool = await getPool();

  const query = `SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_NAME = '${table}'
    AND COLUMN_NAME = '${column}'
    AND REFERENCED_TABLE_NAME IS NOT NULL;`;

  const [result] = await pool.query<fkeyCheckResult[]>(query);

  if (result.length === 0) {
    logger.info(`No foreign key constraint on ${column} !!`);
    return;
  }

  const { CONSTRAINT_NAME: fkeyConstraint } = result[0]!;

  const sql = `ALTER TABLE ${table} DROP CONSTRAINT ${fkeyConstraint}`;

  await pool.query(sql);

  logger.success("fkey constraint deleted !!");
};

// This function will take table the configschema as input and find all the columns to add => then arrange them to non foreign keys first then foreign keys
// @returns : tables[]
export const findAndSortTablesBasedOnColumnsToAdd = async (
  configSchema: Table<Record<string, Column>>[],
) => {
  const tables: Table<Record<string, Column>>[] = [];
  const pool = await getPool();

  for (const table of configSchema) {
    const { columns, name } = table;

    const [result] = await pool.query<DescTableRow[]>(`DESC ${name}`);

    const dbColumnSet: Set<string> = new Set(
      result.map((column) => column.Field),
    );

    const newColumns = Object.fromEntries(
      Object.entries(columns).filter(([_, column]) => {
        if (!dbColumnSet.has(column.name)) return true;
      }),
    );

    if (Object.keys(newColumns).length === 0) continue;

    tables.push({
      name,
      columns: newColumns,
    });
  }

  return [
    ...tables.filter(({ columns }) => {
      return Object.values(columns).every((column) => !column.fkey);
    }),
    ...tables.filter(({ columns }) => {
      return Object.values(columns).some((column) => column.fkey);
    }),
  ];
};

export const deleteFkConstraintsFirstBeforeDeletingColumn = async (
  configSchema: Table<Record<string, Column>>[],
) => {
  const tables = [];
  const pool = await getPool();

  for (const table of configSchema) {
    const { name, columns } = table;

    const [result] = await pool.query<DescTableRow[]>(`DESC ${name}`);

    const dbColumns = result.map((column) => column.Field);
    const configColumnsSet: Set<string> = new Set(
      Object.values(columns).map((column) => column.name),
    );

    const columnsToRemove = dbColumns.filter(
      (column) => !configColumnsSet.has(column),
    );

    if (columnsToRemove.length === dbColumns.length) {
      throw new CoremError({
        code: "INVALID_REQUEST",
        message:
          "Cannot remove all the columns ! remove the whole table insted !!",
      });
    }

    if (columnsToRemove.length === 0) continue;

    await Promise.all(
      columnsToRemove.map((column) =>
        dropForeignKeyConstraintIfExists({ column, table: name }),
      ),
    );

    tables.push({
      name,
      columns: columnsToRemove,
    });
  }

  return tables;
};

export const parseDbConstrains = (
  dbConstraints: DbConstraintsOutput,
): Constraint[] => {
  let parsedDbConstraints: Constraint[] = [];

  if (dbConstraints.IS_NULLABLE === "NO") {
    parsedDbConstraints.push("NOT NULL");
  }

  if (dbConstraints.COLUMN_DEFAULT !== null) {
    if (dbConstraints.COLUMN_TYPE === "timestamp") {
      if (
        dbConstraints.EXTRA === "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
      ) {
        parsedDbConstraints.push(
          `DEFAULT ${dbConstraints.COLUMN_DEFAULT} ON UPDATE CURRENT_TIMESTAMP`,
        );
      } else {
        parsedDbConstraints.push(`DEFAULT ${dbConstraints.COLUMN_DEFAULT}`);
      }
    } else {
      parsedDbConstraints.push(`DEFAULT '${dbConstraints.COLUMN_DEFAULT}'`);
    }
  }

  if (dbConstraints.COLUMN_KEY === "PRI") {
    parsedDbConstraints.push("PRIMARY KEY");
  }

  if (dbConstraints.COLUMN_KEY === "UNI") {
    parsedDbConstraints.push("UNIQUE");
  }

  if (dbConstraints.EXTRA === "auto_increment") {
    parsedDbConstraints.push("AUTO_INCREMENT");
  }

  return parsedDbConstraints;
};
