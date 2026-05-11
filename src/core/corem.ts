import { getPool } from "@/db";
import { QueryBuilder } from "@/query-builder/query-builder";

interface coremInput {
  host: string;
  user: string;
  password: string;
  database: string;
}

export const corem = async () => {

  const pool = await getPool();

  return new QueryBuilder(pool);
};
