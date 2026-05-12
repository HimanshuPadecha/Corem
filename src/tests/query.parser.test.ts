import { corem } from "@/core/corem";
import { asc, desc, eq } from "@/core/query-utils";
import { getPool } from "@/db";
import { users } from "@/db/schema";

test("simple query", async () => {
  const db = await corem();

  try {
    const dbUsers = await db
      .select({ userId: users.columns.id, username: users.columns.name })
      .from(users)
      .where(eq(users.columns.id, 10))
      .orderBy(desc(users.columns.id), asc(users.columns.name))
      .limit(10)
      .execute();

    console.log(dbUsers);
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});
