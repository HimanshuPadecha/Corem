import { getPool, getPoolPromise } from "@/db/index.js";
import { QueryBuilder } from "@/query-builder/query-builder.js";

export const corem = () => {
  const poolPromise = getPoolPromise();

  return new QueryBuilder(poolPromise);
};
