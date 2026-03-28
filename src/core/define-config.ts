import dotenv from "dotenv"
import { CoremConfig } from "@/types/corem-config";

dotenv.config()

export const defineConfig = (config: CoremConfig) => {
  return config;
};
