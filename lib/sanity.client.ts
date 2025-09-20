import "server-only";

import { createClient } from "next-sanity";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable for Sanity client.`);
  }
  return value;
}

export const sanityConfig = {
  projectId: requireEnv("SANITY_PROJECT_ID"),
  dataset: requireEnv("SANITY_DATASET"),
  apiVersion: requireEnv("SANITY_API_VERSION"),
  useCdn: true,
};

export const sanityClient = createClient(sanityConfig);
