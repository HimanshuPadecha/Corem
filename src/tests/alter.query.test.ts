import { closePool } from "@/db";
import {
  checkAndAddTablesInDb,
  checkAndRemoveTablesInDb,
} from "@/core/table-updation";
import { getConfig, getDbTables, getUserSchema } from "@/utils/utils";
import { tableColumnsAdditionCheck } from "@/core/column-updation";

test("check new table add for database", async () => {
  const dbTables: string[] = await getDbTables();

  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  if (configSchema === null) {
    console.log("schema is null");
    return;
  }

  await checkAndAddTablesInDb(dbTables, configSchema);
});

test("check table deletion", async () => {
  const dbTables: string[] = await getDbTables();

  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  await checkAndRemoveTablesInDb(dbTables, configSchema);
});

test("check column add", async () => {
  const coremConfig = await getConfig();
  const configSchema = await getUserSchema(coremConfig);

  if (!configSchema) {
    return;
  }

  for (const table of configSchema) {
    await tableColumnsAdditionCheck(table);
  }
});

afterAll(async () => {
  await closePool();
});
