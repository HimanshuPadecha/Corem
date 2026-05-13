import { createJiti } from "jiti";
import path from "path"

const root = process.cwd()

export const jiti = createJiti(import.meta.url, {
  alias: {
    "@": path.join(root, "src"),
  },
});
