import { getPool } from "@/db/index.js";
import { QueryBuilder } from "@/query-builder/query-builder.js";

export const corem = async () => {

  const pool = await getPool();

  return new QueryBuilder(pool);
};
