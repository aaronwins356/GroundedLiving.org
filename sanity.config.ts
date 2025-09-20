import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

import post from "./schemas/post";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable for Sanity configuration.`);
  }
  return value;
}

export default defineConfig({
  basePath: "/studio",
  title: "Grounded Living CMS",
  projectId: requireEnv("SANITY_PROJECT_ID"),
  dataset: requireEnv("SANITY_DATASET"),
  schema: {
    types: [post],
  },
  plugins: [deskTool()],
});
