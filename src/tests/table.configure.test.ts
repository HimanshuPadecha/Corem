import { int } from "../columns/int";
import { varchar } from "../columns/varchar";
import { Table } from "../core/table";
import { pool } from "../db";
import { tableParser } from "../parser/table-parser";

let users: any;

beforeAll(() => {
  users = Table("users", {
    id: int("id").primaryKey().autoIncrement().notNull(),
    name: varchar("name", 255).notNull(),
  });
});

test("table function check", () => {
  console.log(users);

  expect(users.name).toBe("users");

  expect(users.columns.id.name).toBe("id");
});

test("schema generation test", () => {
  const schema = tableParser(users);

  console.log(
    "-----------------------------------------------------------------------------------\n\n" +
      schema +
      "\n\n-------------------------------------------------------------------------------------",
  );
});

test("feed user table to database", async () => {
  const schema = tableParser(users);

  try {
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
