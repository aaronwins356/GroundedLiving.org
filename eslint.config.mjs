import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

const config = [
  {
    ignores: ["node_modules", ".next", "dist"],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default config;
