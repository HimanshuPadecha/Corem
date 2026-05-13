import { closePool, getPool } from "@/db/index.js";
import {
  checkAndAddTablesInDb,
  checkAndRemoveTablesInDb,
} from "@/core/table-updation.js";
import { getConfig, getDbTables, getUserSchema } from "@/utils/utils.js";
import {
  tableColumnsAddition,
  tableColumnsDeletion,
} from "@/core/column-updation.js";

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
    await tableColumnsAddition(table);
  }
});

// test("check column remove", async () => {
//   const coremConfig = await getConfig();
//   const configSchema = await getUserSchema(coremConfig);

//   if (coremConfig === null) {
//     return;
//   }

//   for (const table of configSchema!) {
//     await tableColumnsDeletion(table);
//   }
// });

test("is foreign key test", async () => {
  const pool = await getPool();

  const query = `SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'posts'
  AND COLUMN_NAME = 'user_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;`;

  const [result] = await pool.query(query);

  console.log(result);
  
});

afterAll(async () => {
  await closePool();
});
