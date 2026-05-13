import { getPool } from "@/db/index.js";
import { tableParser } from "@/parser/table-parser.js";
import { Console } from "@/utils/utils.js";
import { posts, users } from "../db/schema.js";
import type { Pool } from "mysql2/promise";

let pool: Pool;

beforeAll(async () => {
  pool = await getPool();
});

test("table schema check ", () => {
  console.log(users);

  expect(users.name).toBe("users");

  expect(users.columns.id.name).toBe("id");
});

test("schema generation test",async () => {
  const schema = await tableParser(users);

  Console.log(schema);
});

test("feed user table to database", async () => {
  try {
    const schema = await tableParser(users);
    const [rows] = await pool.query("SHOW TABLES");
    console.log(rows);

    await pool.query(schema);

    const [tables] = await pool.query("SHOW TABLES");
    console.log(tables);

    expect(tables).toEqual([{ Tables_in_new_database: "users" }]);
  } catch (error) {
    console.log(error);
  }
});

// test("check the fkey check query", async () => {
//   const number = await isForeignKey(users.columns.id);

//   console.log({ number });

//   expect(number).toBe(1);
// });

test("feed tables with foreign keys to database", async () => {
  try {
    const schema = await tableParser(posts);
    Console.log(schema);

    const [result] = await pool.query(schema);

    Console.log(result);
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});
