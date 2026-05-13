import { getConfig } from "@/utils/utils.js";
import path from "node:path";
import fs from "fs";
import { CoremError } from "@/core/corem-error.js";
import { Column } from "@/types/column.js";
import { tableParser } from "@/parser/table-parser.js";
import { Table } from "@/types/table.js";
import { getPool } from "@/db/index.js";

test("check import", async () => {
  const coremConfig = await getConfig();

  const { schema } = coremConfig;
  console.log(schema);

  if (!schema) {
    console.log(schema);
  }

  if (!fs.existsSync(path.join(process.cwd(), schema))) {
    throw new CoremError({
      code: "INVALID_SCHEMA",
      message: "path not found to schema",
    });
  }

  const module = await import(path.join(process.cwd(), schema));
  console.log(module);
});

test("Checking if we can load the confing file", async () => {
  const coremConfig = await getConfig();

  console.log(coremConfig);
  console.log(coremConfig.schema);
});

test("get the schema from the config", async () => {
  const coremConfig = await getConfig();

  const { schema: schemaPath } = coremConfig;

  const fullPath = path.resolve(process.cwd(), schemaPath);

  const schema = await import(fullPath);

  const pool = await getPool();

  for (const [_, value] of Object.entries(schema) as unknown as [
    string,
    Table<Record<string, Column>>,
  ][]) {
    const tableSchema = await tableParser(value);

    await pool.query(tableSchema);
  }
});

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});
