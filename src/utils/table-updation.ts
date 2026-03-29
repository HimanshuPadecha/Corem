import { getPool } from "@/db";
import { tableParser } from "@/parser/table-parser";
import { Column } from "@/types/column";
import { Table } from "@/types/table";
import {
  getTablesWithForeignKeys,
  getTablesWithoutForeignKeys,
  logger,
} from "./utils";

export const checkAndAddTableInDb = async (
  dbTables: string[],
  configSchema: Table<Record<string, Column>>[],
) => {
  try {
    const dbTableSet: Set<string> = new Set(dbTables);
    const pool = await getPool();

    // if the table is in configTables and not in dbTables means it is new Table added by user..

    const newTables = configSchema.filter(
      (table) => !dbTableSet.has(table.name),
    );

    if (newTables.length === 0) {
      logger.success("No new Tables to add..");
      return;
    }

    if (newTables.length === 1) {
      const onlyTable = newTables[0]!;
      await pool.query(await tableParser(onlyTable));
    }

    const tablesWithoutForeignKeys = getTablesWithoutForeignKeys(newTables);

    const schemaForTablesWithoutForeignKeys = await Promise.all(
      tablesWithoutForeignKeys.map((table) => tableParser(table)),
    );

    await Promise.all(
      schemaForTablesWithoutForeignKeys.map((schema) => pool.query(schema)),
    );

    logger.success(
      `Tables added to database : ${tablesWithoutForeignKeys.map((table) => table.name).join(" , ")}`,
    );

    const tablesWithForeignKeys = getTablesWithForeignKeys(newTables);

    const schemaForTablesWithForeignKeys = await Promise.all(
      tablesWithForeignKeys.map((table) => tableParser(table)),
    );

    await Promise.all(
      schemaForTablesWithForeignKeys.map((schema) => pool.query(schema)),
    );

    logger.success(
      `New Tables added to database : ${tablesWithForeignKeys.map((table) => table.name).join(" , ")} `,
    );
  } catch (error) {
    console.log(error);
  }
};
