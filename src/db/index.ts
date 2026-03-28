import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
import { getConfig } from "@/utils/utils";

dotenv.config();

let pool: Pool | undefined;

export const getPool = async () => {
  if (pool) return pool;

  const coremConfig = await getConfig();
  const { credentials } = coremConfig;

  pool = mysql.createPool({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.db_name,
    port: 3306,

    ssl: {
      rejectUnauthorized: false,
    },

    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 10000,
  });

  return pool;
};
