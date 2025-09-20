import { fileURLToPath } from "node:url";
import path from "node:path";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

const config = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: ["**/node_modules/**", ".next/**"],
  },
];

export default config;
