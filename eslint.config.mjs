import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  {
    ignores: ["node_modules", ".next", "dist"],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default config;
