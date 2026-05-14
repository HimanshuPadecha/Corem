# 🛡️ Corem

**Lightweight, Type-safe MySQL ORM & Migration Tool for Modern TypeScript**

  [npm version](https://www.npmjs.com/package/corem)  
  [TypeScript](https://www.typescriptlang.org/)  
  [License](https://github.com/HimanshuPadecha/corem/blob/main/LICENSE)  


**Corem** is a powerful, minimal, and fully type-safe ORM built specifically for TypeScript and MySQL. Inspired by modern tooling like Drizzle, it provides a fluent SQL-like query builder, strong schema inference, and seamless migration commands—all without the bloated overhead.

## ✨ Features

- 🔒 **End-to-End Type Safety** - Catch errors at compile-time with strong TypeScript inference.
- 🚀 **Fluent Query Builder** - Write SQL intuitively with a simple, chainable API.
- 📦 **Zero-Config Migrations** - Automatically sync your schema to your database via CLI.
- 🔗 **First-Class Relations** - Easily manage foreign keys and perform typed SQL joins.
- 🪶 **Lightweight & Fast** - Minimal runtime footprint designed for high performance.
- 🛠️ **Modern TypeScript** - Built for ES Modules, standard TypeScript, and modern tooling.

---

## 📦 Installation

Install `corem` alongside its peer dependencies (such as `mysql2` if you haven't already):

```bash
# Using npm
npm install corem

# Using yarn
yarn add corem

# Using pnpm
pnpm add corem
```

---

## 🚀 Quick Start

### 1. Setup Environment Variables

Create a `.env` file in the root of your project:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=my_database
```

### 2. Configure Corem

Create a `corem.config.ts` file in your project root to tell the CLI where your schema lives and how to connect to the database.

```typescript
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

### 3. Define Your Schema

Define your tables using Corem's type-safe schema builder. Create `src/db/schema.ts`:

```typescript
import { int, varchar, text, timestamp } from "corem/columns";
import { Table } from "corem/core";

export const users = Table("users", {
  id: int("id").primaryKey().autoIncrement().notNull(),
  name: varchar("name", 255).notNull(),
  email: varchar("email", 255).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = Table("posts", {
  id: int("id").primaryKey().autoIncrement(),
  title: varchar("title", 255).notNull(),
  userId: int("user_id")
    .references(() => users.columns.id, { onDelete: "cascade" })
    .notNull(),
});
```

### 4. Push Schema to Database

Use the Corem CLI to automatically sync your defined schema with your MySQL database:

```bash
npx corem push
```

### 5. Initialize the Database Client

Create an instance of the database to execute queries. Create `src/db/index.ts`:

```typescript
import { corem } from "corem";

// Initialize and export the database connection
export const db = await corem();
```

---

## 📖 Query Builder API

Corem provides a fluent, SQL-like query builder that is 100% type-safe based on your schema.

### Select Queries

#### Basic Select

```typescript
const allUsers = await db.select().from(users).execute();
// SELECT * FROM users;
```

#### Select Specific Columns

```typescript
const result = await db
  .select({
    id: users.columns.id,
    username: users.columns.name,
  })
  .from(users)
  .execute();
// SELECT users.id AS id, users.name AS username FROM users;
```

#### Where Conditions

```typescript
import { eq, and } from "corem/utils";

const result = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.columns.id, 1),
      eq(users.columns.name, "John")
    )
  )
  .execute();
```

### Insert Queries

```typescript
await db
  .insert(users)
  .values({
    name: "John Doe",
    email: "john@example.com",
  })
  .execute();
// INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
```

*(Note: Bulk inserts are coming in a future update!)*

### Update Queries

```typescript
await db
  .update(users)
  .set({ name: "Updated Name" })
  .where(eq(users.columns.id, 1))
  .execute();
```

### Delete Queries

```typescript
await db
  .delete()
  .from(users)
  .where(eq(users.columns.id, 10))
  .execute();
```

### Advanced Operations

#### Sorting & Pagination

```typescript
import { asc, desc } from "corem/utils";

const paginatedUsers = await db
  .select()
  .from(users)
  .orderBy(desc(users.columns.createdAt), asc(users.columns.name))
  .limit(10)
  .execute();
```

#### Joins

Corem supports type-safe SQL joins:

```typescript
// Inner Join
const userPosts = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.columns.id, posts.columns.userId))
  .execute();

// Left Join
const usersWithOptionalPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.columns.id, posts.columns.userId))
  .execute();
```

---

## 🏗️ Supported Column Constraints

Define database constraints smoothly via chained methods:

- `.primaryKey()` - Sets column as primary key.
- `.autoIncrement()` - Makes an integer column auto-increment.
- `.notNull()` - Marks column as required (NOT NULL).
- `.unique()` - Adds a unique constraint.
- `.defaultNow()` - Sets the default value to current timestamp.
- `.references(() => column, { onDelete: 'cascade' })` - Sets up a foreign key.

---

## 🗺️ Roadmap

Corem is actively evolving. Here is what we have planned:

- PostgreSQL & SQLite Support
- Advanced Migration History System
- Complex Relational Fetching API
- Query Logging & Profiling
- Database Transactions
- Automatic Schema Introspection

---

## 🤝 Contributing

We welcome community contributions! To get started:

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](./LICENSE).

---

*Built with ❤️ for the TypeScript ecosystem.*