import "server-only";

import type { SanityClient } from "@sanity/client";
import { createClient } from "next-sanity";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? "2023-10-01";
const useCdn = process.env.SANITY_USE_CDN !== "false";

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
} as const;

let cachedClient: SanityClient | null | undefined;

export function getSanityClient(): SanityClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!projectId || !dataset) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SANITY_PROJECT_ID and SANITY_DATASET must be defined");
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn("Sanity credentials are missing. Returning empty client in development builds.");
    }

    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
  });

  return cachedClient;
}
