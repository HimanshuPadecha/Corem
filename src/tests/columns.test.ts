import { int, varchar, sqlEnum } from "@/columns";
import { Console } from "@/utils/utils";
import { Table } from "@/core/table";
import { tableParser } from "@/parser/table-parser";

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

test("check enum", () => {
  const users = Table("users", {
    id: int("id").notNull().primaryKey().autoIncrement(),
    status: sqlEnum("status", ["Active", "Inactive"] as const)
      .notNull()
      .default("Active"),
  });

  const schema = tableParser(users);

  Console.log(schema);
});
