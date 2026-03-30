import { closePool } from "@/db";
import {
  dropForeignKeyConstraintIfExists,
  findAndSortTablesBasedOnColumnsToAdd,
  getConfig,
  getUserSchema,
} from "@/utils/utils";

test("get schema", async () => {
  const coremConfig = await getConfig();
  const schema = await getUserSchema(coremConfig);

  console.log(schema);
});

test("constraint drop check", async () => {
  await dropForeignKeyConstraintIfExists({ table: "posts", column: "user_id" });
});

test("add column add fn check", async () => {
  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  const tablesWithNewColumns = await findAndSortTablesBasedOnColumnsToAdd(
    configSchema!,
  );

  console.log(tablesWithNewColumns);
});

afterAll(async () => {
  await closePool();
});
