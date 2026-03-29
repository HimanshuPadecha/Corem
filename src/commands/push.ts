import { getPool } from "@/db";
import {
  checkAndAddTableInDb,
  checkAndRemoveTableInDb,
} from "@/core/table-updation";
import { getConfig, getDbTables, getUserSchema, logger } from "@/utils/utils";
import dotenv from "dotenv";
import { tableColumnsAdditionCheck } from "@/core/column-updation";
import { CoremError } from "@/core/corem-error";

dotenv.config({ quiet: true });

export const push = async () => {
  const pool = await getPool();
  try {
    logger.step("Starting Corem push...");

    logger.info("Loading config...");
    logger.info("Connecting to database...");

    const dbTables: string[] = await getDbTables();

    const coremConfig = await getConfig();

    const configSchema = await getUserSchema(coremConfig);

    await checkAndAddTableInDb(dbTables, configSchema);

    await checkAndRemoveTableInDb(dbTables, configSchema);

    for (const table of configSchema) {
      await tableColumnsAdditionCheck(table);
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
