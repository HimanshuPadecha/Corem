import { closePool } from "@/db";
import {
  checkAndAddTableInDb,
  checkAndRemoveTableInDb,
} from "@/core/table-updation";
import { getConfig, getDbTables, getUserSchema } from "@/utils/utils";
import { tableColumnsAdditionCheck } from "@/core/column-updation";

test("check new table add for database", async () => {
  const dbTables: string[] = await getDbTables();

  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  await checkAndAddTableInDb(dbTables, configSchema);
});

test("check table deletion", async () => {
  const dbTables: string[] = await getDbTables();

  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  await checkAndRemoveTableInDb(dbTables, configSchema);
});

test("check column add", async () => {
  const coremConfig = await getConfig();
  const configSchema = await getUserSchema(coremConfig);

  for (const table of configSchema) {
    await tableColumnsAdditionCheck(table);
  }
});

afterAll(async () => {
  await closePool();
});
