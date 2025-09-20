import "server-only";

import { createClient } from "next-sanity";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable for Sanity client.`);
  }
  return value;
}

const projectId = requireEnv("SANITY_PROJECT_ID");
const dataset = requireEnv("SANITY_DATASET");
const apiVersion = requireEnv("SANITY_API_VERSION");

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(sanityConfig);
