declare module "tailwindcss" {
  import type { Plugin } from "postcss";

  export interface Config {
    content?: Array<string | { files: string[]; extract?: unknown }>;
    darkMode?: "media" | "class" | false | string;
    theme?: Record<string, unknown>;
    plugins?: Array<unknown>;
    [key: string]: unknown;
  }

  interface TailwindOptions {
    config?: string;
  }

  export default function tailwindcss(options?: TailwindOptions): Plugin;
}
