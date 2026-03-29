import { getPool } from "@/db";
import {
  checkAndAddTableInDb,
  checkAndRemoveTableInDb,
} from "@/utils/table-updation";
import { getConfig, getDbTables, getUserSchema, logger } from "@/utils/utils";
import dotenv from "dotenv";

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

    logger.success("Changes Applied !");
  } catch (error) {
    console.log(error);
  } finally {
    await pool.end();
  }
};
