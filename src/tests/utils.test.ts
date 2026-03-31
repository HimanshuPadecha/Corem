import { closePool } from "@/db";
import {
  deleteFkConstraintsFirstBeforeDeletingColumn,
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

test("test delete fk constraints fn", async () => {
  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  const tables = await deleteFkConstraintsFirstBeforeDeletingColumn(
    configSchema!,
  );

  console.log(tables);
});

afterAll(async () => {
  await closePool();
});
