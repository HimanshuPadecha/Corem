import { int, text, timestamp, varchar } from "@/columns";
import { Table } from "@/core/table";

export const users = Table("users", {
  id: int("id").primaryKey().autoIncrement().notNull(),
  name: varchar("name", 255).notNull().default("ramu"),
  address: text("address").notNull(),
  new_home: text("new_home"),
  home: varchar("home", 255).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull().defaultNow(),
});

export const posts = Table("posts", {
  userId: int("user_id"),
  id: int("id"),
});