import "server-only";

import { createClient } from "next-sanity";

function readEnv(name: string, fallback: string) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }
  return value;
}

const projectId = readEnv("SANITY_PROJECT_ID", "offline-project");
const dataset = readEnv("SANITY_DATASET", "offline-dataset");
const apiVersion = readEnv("SANITY_API_VERSION", "2024-01-01");

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(sanityConfig);
