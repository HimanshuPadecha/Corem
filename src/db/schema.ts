import { int, text, timestamp, varchar } from "@/columns";
import { Table } from "@/core/table";

export const users = Table("users", {
  id: int("id").notNull().primaryKey().autoIncrement(),
  name: varchar("name", 255).notNull(),
  address: text("address").notNull(),
  new_home: text("new_home"),
  home: varchar("home", 255),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .notNull(),
});

export const posts = Table("posts", {
  userId: int("user_id"),
  id: int("id"),
});