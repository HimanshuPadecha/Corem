import { closePool } from "@/db";
import {
  checkAndAddTableInDb,
  checkAndRemoveTableInDb,
} from "@/utils/table-updation";
import { getConfig, getDbTables, getUserSchema } from "@/utils/utils";

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

afterAll(async () => {
  await closePool();
});
