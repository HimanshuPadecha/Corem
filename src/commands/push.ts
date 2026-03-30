import { getPool } from "@/db";
import {
  checkAndAddTablesInDb,
  checkAndRemoveTablesInDb,
} from "@/core/table-updation";
import {
  findAndSortTablesBasedOnColumnsToAdd,
  getConfig,
  getDbTables,
  getUserSchema,
  logger,
} from "@/utils/utils";
import dotenv from "dotenv";
import { tableColumnsAddition } from "@/core/column-updation";
import { CoremError } from "@/core/corem-error";

dotenv.config({ quiet: true });

export const push = async () => {
  const pool = await getPool();
  try {
    logger.step("Starting Corem push...");

    logger.info("Loading config...");
    logger.info("Connecting to database...");

    let dbTables: string[] = await getDbTables();

    const coremConfig = await getConfig();

    const configSchema = await getUserSchema(coremConfig);

    const deletedTables = await checkAndRemoveTablesInDb(
      dbTables,
      configSchema,
    );

    if (deletedTables !== undefined) {
      dbTables = await getDbTables();
    }

    if (dbTables.length === 0 && configSchema === null) {
      logger.success("Changes applied !!");
      return;
    }

    if (configSchema === null) {
      return;
    }

    await checkAndAddTablesInDb(dbTables, configSchema);

    const sortedTablesWithNewColumns =
      await findAndSortTablesBasedOnColumnsToAdd(configSchema);

    if (sortedTablesWithNewColumns.length > 0) {
      for (const table of sortedTablesWithNewColumns) {
        await tableColumnsAddition(table);
      }
    }

    logger.success("Changes Applied !");
  } catch (error) {
    logger.error("push stopped");
    console.log(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};
