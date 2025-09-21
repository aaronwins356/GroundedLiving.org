import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

import post from "./schemas/post";

function getEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`Missing ${name} environment variable for Sanity configuration. Using fallback value.`);
  }
  return value ?? fallback;
}

export default defineConfig({
  basePath: "/studio",
  title: "Grounded Living CMS",
  projectId: getEnv("SANITY_PROJECT_ID", "local"),
  dataset: getEnv("SANITY_DATASET", "development"),
  schema: {
    types: [post],
  },
  plugins: [deskTool()],
});
