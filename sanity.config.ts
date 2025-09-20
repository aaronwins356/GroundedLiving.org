import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

import { schemaTypes } from "./schemas";

function readEnv(name: string, fallback: string) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`Missing ${name} environment variable for Sanity Studio. Using fallback value.`);
  }
  return value ?? fallback;
}

const projectId = readEnv("SANITY_PROJECT_ID", "stub-project");
const dataset = readEnv("SANITY_DATASET", "stub-dataset");
const apiVersion = readEnv("SANITY_API_VERSION", "2025-01-01");

export default defineConfig({
  basePath: "/studio",
  name: "grounded_living_studio",
  title: "Grounded Living Studio",
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
