import { int } from "../columns/int";
import { varchar } from "../columns/varchar";

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
