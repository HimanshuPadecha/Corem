import { corem } from "@/core/corem";
import { getPool } from "@/db";
import { users } from "@/db/schema";

test("simple query", async () => {
  const db = await corem();

  const [user] = await db
    .select()
    .from(users)
    .limit(1)
    .execute();

    console.log(user);
});

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});
