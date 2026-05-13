import dotenv from "dotenv"
import { CoremConfig } from "@/types/corem-config.js";

dotenv.config()

export const defineConfig = (config: CoremConfig) => {
  return config;
};
