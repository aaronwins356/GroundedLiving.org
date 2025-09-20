import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";

import { schemaTypes } from "./schemas";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable for Sanity configuration.`);
  }
  return value;
}

const projectId = requireEnv("SANITY_PROJECT_ID");
const dataset = requireEnv("SANITY_DATASET");
const apiVersion = requireEnv("SANITY_API_VERSION");

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
