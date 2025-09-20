import "server-only";

import { createClient } from "next-sanity";

function readEnv(name: string, fallback: string) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`Missing ${name} environment variable for Sanity client. Using fallback value.`);
  }
  return value ?? fallback;
}

const projectId = readEnv("SANITY_PROJECT_ID", "stub-project");
const dataset = readEnv("SANITY_DATASET", "stub-dataset");
const apiVersion = readEnv("SANITY_API_VERSION", "2025-01-01");

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(sanityConfig);
