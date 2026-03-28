import { int, timestamp, varchar } from "@/columns";
import { Table } from "@/core/table";

export const users = Table("users", {
  id: int("id").primaryKey().autoIncrement().notNull(),
  name: varchar("name", 255).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow({ onUpdate: "CURRENT" }),
});

export const posts = Table("posts", {
  userId: int("user_id").references(() => users.columns.id, {
    onDelete: "cascade",
  }),
});
