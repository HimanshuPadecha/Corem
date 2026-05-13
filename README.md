# Corem

Lightweight TypeScript ORM for SQL databases with a fluent query builder and type-safe schema definitions.

## Features

* Type-safe schema definitions
* Fluent SQL query builder
* MySQL support
* Strong TypeScript inference
* Relations and foreign keys
* Minimal and clean API
* SQL-like syntax
* Fast and lightweight
* Built for modern TypeScript applications

---

# Installation

```bash
npm install corem
```

or

```bash
yarn add corem
```

or

```bash
pnpm add corem
```

---

# Setup Environment Variables

Create a `.env` file in the root of your project.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=test
```

---

# Create Corem Config

Create a `corem.config.ts` file in the root of your project.

```ts
import { defineConfig } from "corem/config";

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
```

---

# Project Structure

```txt
.
├── corem.config.ts
├── .env
├── src/
│   └── db/
│       ├── index.ts
│       └── schema.ts
└── package.json
```

---

# Create Database Instance

Create `src/db/index.ts`

```ts
import { corem } from "corem";

const getDb = async () => {
  return await corem();
};

export const db = await getDb();
```

---

# Create Schema

Create `src/db/schema.ts`

```ts
import { int, text, timestamp, varchar } from "@/columns/index.js";
import { Table } from "@/core/table.js";

export const users = Table("users", {
  id: int("id")
    .primaryKey()
    .autoIncrement()
    .notNull(),

  name: varchar("name", 255),

  address: text("address"),

  new_home: text("new_home")
    .notNull(),

  home: varchar("home", 255)
    .notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .defaultNow(),
});

export const posts = Table("posts", {
  userId: int("user_id")
    .references(() => users.columns.id)
    .notNull(),

  id: int("id"),
});
```

---

# Push Schema To Database

```bash
npx corem push
```

---

# Select Queries

```ts
import {
  mysqlTable,
  int,
  varchar,
  timestamp,
} from "corem";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoIncrement(),

  name: varchar("name", 255).notNull(),

  email: varchar("email", 255)
    .notNull()
    .unique(),

  createdAt: timestamp("created_at")
    .defaultNow(),
});
```

---

# Select Queries

## Basic Select

```ts
const result = await db
  .select()
  .from(users)
  .execute();
```

Generated SQL:

```sql
SELECT * FROM users;
```

---

## Select Specific Columns

```ts
const result = await db
  .select({
    id: users.columns.id,
    username: users.columns.name,
  })
  .from(users)
  .execute();
```

Generated SQL:

```sql
SELECT users.id AS id, users.name AS username FROM users;
```

---

# Where Conditions

```ts
const result = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.columns.id, 1),
      eq(users.columns.name, "first"),
    ),
  )
  .execute();
```

Generated SQL:

```sql
SELECT * FROM users
WHERE users.id = 1
AND users.name = 'ALEX';
```

---

# Insert Queries

## Insert Single Row

```ts
await db
  .insert(users)
  .values(
    {
      id: 1,
      name: "first",
    }
  )
  .execute();
```

Generated SQL:

```sql
INSERT INTO users (name, email)
VALUES ('john', 'john@gmail.com');
```

---

## Insert Multiple Rows - future update 

```ts
await db
  .insert(users)
  .values([
    {
      name: "John",
      email: "john@gmail.com",
    },
    {
      name: "Alex",
      email: "alex@gmail.com",
    },
  ]);
```

---

# Update Queries

```ts
await db
  .update(users)
  .set({
    name: "updated",
  })
  .where(eq(users.columns.id, 1))
  .execute();
```

Generated SQL:

```sql
UPDATE users
SET name = 'Updated Name'
WHERE users.id = 1;
```

---

# Delete Queries

```ts
await db
  .delete()
  .from(users)
  .where(eq(users.columns.id, 10))
  .execute();
```

Generated SQL:

```sql
DELETE FROM users
WHERE users.id = 1;
```

---

# Order By

```ts
const result = await db
  .select()
  .from(users)
  .orderBy(
    desc(users.id),
    asc(users.name),
  );
```

Generated SQL:

```sql
SELECT * FROM users
ORDER BY users.id DESC, users.name ASC;
```

---

# Limit

```ts
const result = await db
  .select()
  .from(users)
  .limit(10);
```

Generated SQL:

```sql
SELECT * FROM users LIMIT 10;
```

---

# Joins

## Inner Join

```ts
const result = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.userId));
```

Generated SQL:

```sql
SELECT * FROM users
INNER JOIN posts
ON users.id = posts.user_id;
```

---

## Left Join

```ts
const result = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId));
```

Generated SQL:

```sql
SELECT * FROM users
LEFT JOIN posts
ON users.id = posts.user_id;
```

---

# Foreign Keys

```ts
export const posts = mysqlTable("posts", {
  id: int("id")
    .primaryKey()
    .autoIncrement(),

  title: varchar("title", 255)
    .notNull(),

  userId: int("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    }),
});
```

---

# Constraints

## Primary Key

```ts
int("id")
  .primaryKey();
```

## Auto Increment

```ts
int("id")
  .autoIncrement();
```

## Not Null

```ts
varchar("name", 255)
  .notNull();
```

## Unique

```ts
varchar("email", 255)
  .unique();
```

## Default

```ts
timestamp("created_at")
  .defaultNow();
```

```txt
src/
├── db/
│   ├── index.ts
│   └── schema.ts
├── routes/
├── services/
└── app.ts
```

---

# Why Corem?

Corem is designed for developers who want:

* Type safety without complexity
* SQL-like syntax
* Lightweight architecture
* Fast query building
* Full TypeScript support
* Better developer experience

---

# Roadmap

* [ ] PostgreSQL support
* [ ] SQLite support
* [ ] Migration system
* [ ] Relation API
* [ ] CLI tools
* [ ] Query logging
* [ ] Transactions
* [ ] Schema introspection

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

---

# License

MIT
