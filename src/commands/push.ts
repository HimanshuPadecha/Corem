import { getPool } from "@/db";
import { tableParser } from "@/parser/table-parser";
import { Column } from "@/types/column";
import { Table } from "@/types/table";
import { getConfig, getUserSchema, logger } from "@/utils/utils";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const push = async () => {
  const pool = await getPool();
  try {
    logger.step("Starting Corem push...");

    logger.info("Loading config...");
    logger.info("Connecting to database...");

    const coremConfig = await getConfig();

    const tables = await getUserSchema(coremConfig);

    for (const table of tables) {
      logger.info(`Shipping table schema : ${table.name}`);

      const schema = await tableParser(table);

      await pool.query(schema);

      logger.success(`Table populated : ${table.name}`);
    }

    logger.success("All tables pushed successfully !");
  } catch (error) {
    console.log(error);
  } finally {
    await pool.end();
  }
};
