import { defineConfig } from "@/core/define-config";

export default defineConfig({
  schema: "src/db/schema.ts",
  database: "mysql",
  credentials: {
    db_name: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    password: process.env.DB_PASSWORD!,
    user: process.env.DB_USER!,
  },
});
