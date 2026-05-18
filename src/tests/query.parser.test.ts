import { corem } from "@/core/corem.js";
import { and, asc, desc, eq, lt, ne } from "@/core/query-utils.js";
import { getPool } from "@/db/index.js";
import { posts, users } from "@/db/schema.js";
import { sqlToTsTypes } from "@/types/query-parser.js";

const db = corem();
test("simple query", async () => {
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

test("update testing", async () => {
  try {
    // await db.insert(users).values({ id: 12, name: "first" }).execute();

    // await db.delete().from(users).where(eq(users.columns.id, 10)).execute();

    const date = new Date();

    await db
      .insert(users)
      .values({
        
      })
      .execute();

    const [updatedUser] = await db
      .update(users)
      .set({ name: "hello" })
      .where(eq(users.columns.id, 10))
      .returning()
      .execute();

    console.log(updatedUser);
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});
