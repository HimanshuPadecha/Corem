import { timestamp } from "@/columns/date-time/timestamp";
import { int } from "@/columns/numerics/int";
import { varchar } from "@/columns/strings/varchar";
import { Table } from "@/core/table";
import { pool } from "@/db";
import { tableParser } from "@/parser/table-parser";
import { Console, isForeignKey } from "@/utils/utils";

beforeAll(() => {});

test("table schema check ", () => {
  const users = Table("users", {
    id: int("id").primaryKey().autoIncrement().notNull(),
    name: varchar("name", 255).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow({ onUpdate: "CURRENT" }),
  });
  console.log(users);

  expect(users.name).toBe("users");

  expect(users.columns.id.name).toBe("id");
});

test("schema generation test", () => {
  const users = Table("users", {
    id: int("id").primaryKey().autoIncrement().notNull(),
    name: varchar("name", 255).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow({ onUpdate: "CURRENT" }),
  });
  const schema = tableParser(users);

  Console.log(schema);
});

test("feed user table to database", async () => {
  const users = Table("users", {
    id: int("id").primaryKey().autoIncrement().notNull(),
    name: varchar("name", 255).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow({ onUpdate: "CURRENT" }),
  });

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

test("check the fkey check query", async () => {
  const users = Table("users", {
    id: int("id").primaryKey().autoIncrement().notNull(),
    name: varchar("name", 255).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow({ onUpdate: "CURRENT" }),
  });

  const number = await isForeignKey(users.columns.id);

  console.log({ number });

  expect(number).toBe(1);
});

test("feed tables with foreign keys to database", async () => {
  const users = Table("users", {
    id: int("id").primaryKey().autoIncrement().notNull(),
    name: varchar("name", 255).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow({ onUpdate: "CURRENT" }),
  });

  const posts = Table("posts", {
    userId: int("user_id").references(() => users.columns.id, {
      onDelete: "cascade",
    }),
  });

  try {
    const schema = tableParser(posts);

    Console.log(schema);

    // remove old tables if exists already

    // await pool.query("DROP TABLE IF EXISTS users");
    await pool.query("DROP TABLE IF EXISTS posts");

    const [result] = await pool.query(schema);

    Console.log(result);
  } catch (error) {
    console.log(error);
  }
});
