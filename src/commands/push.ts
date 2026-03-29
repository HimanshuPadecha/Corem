import { getPool } from "@/db";
import { tableParser } from "@/parser/table-parser";
import { Column } from "@/types/column";
import { Table } from "@/types/table";
import { getConfig, logger } from "@/utils/utils";
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

    const { schema: schemaPath } = coremConfig;

    const root = process.cwd();

    const schema = await import(path.resolve(root, schemaPath));

    for (const [key, value] of Object.entries(schema) as unknown as [
      string,
      Table<Record<string, Column>>,
    ][]) {
      logger.info(`Creating Table : ${key}`);

      const tableSchema = tableParser(value);

      await pool.query(tableSchema);
      logger.success(`Table created : ${key}`);
    }
    logger.success("All tables pushed successfully !");
  } catch (error) {
    console.log(error);
  } finally {
    await pool.end();
  }
};
