import { timestamp } from "@/columns/date-time/timestamp";
import { int } from "@/columns/numerics/int";
import { varchar } from "@/columns/strings/varchar";
import { Table } from "@/core/table";
import { pool } from "@/db";
import { tableParser } from "@/parser/table-parser";

let users: any;

beforeAll(() => {
    users = Table("users", {
      id: int("id").primaryKey().autoIncrement().notNull(),
      name: varchar("name", 255).notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow({ onUpdate: "CURRENT" }),
      });

});

test("table schema check ", () => {
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
  
  try {
    const schema = tableParser(users);
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


test("check the fkey check query", () => {
    
})