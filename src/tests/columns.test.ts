import { int, varchar, sqlEnum } from "@/columns/index.js";
import { Console } from "@/utils/utils.js";
import { Table } from "@/core/table.js";
import { tableParser } from "@/parser/table-parser.js";

test("int test", () => {
  const id = int("id").primaryKey().autoIncrement().notNull();

  console.log(id);

  expect(id.name).toBe("id");

  expect(id.type).toBe("INT");

  expect(id.constraints).toEqual(["PRIMARY KEY", "AUTO_INCREMENT", "NOT NULL"]);
});

test("varchar test", () => {
  const name = varchar("name", 255).notNull();

  console.log(name);

  expect(name.name).toBe("name");

  expect(name.constraints).toEqual(["NOT NULL"]);
});

test("check enum", async () => {
  const users = Table("users", {
    id: int("id").notNull().primaryKey().autoIncrement(),
    status: sqlEnum("status", ["Active", "Inactive"] as const)
      .notNull()
      .default("Active"),
  });

  const schema = await tableParser(users);

  Console.log(schema);
});
