import { closePool } from "@/db";
import { checkAndAddTableInDb } from "@/utils/table-updation";
import { getConfig, getDbTables, getUserSchema } from "@/utils/utils";

test("check tables from database", async () => {

  let dbTables: string[] = await getDbTables();

  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  console.log({ dbTables });

  await checkAndAddTableInDb(dbTables, configSchema);
});

afterAll(async () => {
  await closePool();
});
