import { corem } from "@/core/corem";
import { and, asc, desc, eq, lt, ne } from "@/core/query-utils";
import { getPool } from "@/db";
import { posts, users } from "@/db/schema";
import { sqlToTsTypes } from "@/types/query-parser";

test("simple query", async () => {
  const db = await corem();

  try {
    const dbUsers = await db
      .select({ userId: users.columns.id, username: users.columns.name })
      .from(users)
      .innerJoin(posts, eq(users.columns.id, posts.columns.id))
      .where(and(eq(users.columns.id, 1), eq(users.columns.name, "first")))
      .orderBy(desc(users.columns.id), asc(users.columns.name))
      .limit(10)
      .execute();

    console.log(dbUsers);
  } catch (error) {
    console.log(error);
  }
});

test("insert", async () => {
  const db = await corem();

  try {
    await db.insert(users).values({ id: 12, name: "first" }).execute();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.columns.id, 12))
      .limit(1)
      .execute();

    console.log(user);
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});
