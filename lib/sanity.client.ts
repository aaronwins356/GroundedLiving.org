import "server-only";

import type { ClientConfig } from "@sanity/client";
import { createClient } from "next-sanity";

const SANITY_API_VERSION_FALLBACK = "2024-05-01" as const;

// Support both the new NEXT_PUBLIC_* variables and legacy SANITY_* values so existing deployments keep working.
function resolveSanityEnv(
  primary: keyof NodeJS.ProcessEnv,
  legacy?: keyof NodeJS.ProcessEnv,
): string | undefined {
  const primaryValue = process.env[primary];
  if (primaryValue) {
    return primaryValue;
  }

  const legacyValue = legacy ? process.env[legacy] : undefined;

  if (legacyValue && process.env.NODE_ENV !== "production") {
    console.warn(
      `Using legacy \"${String(legacy)}\" for Sanity configuration. Please rename it to \"${String(primary)}\".`,
    );
  }

  return legacyValue;
}

const projectId = resolveSanityEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "SANITY_PROJECT_ID");
const dataset = resolveSanityEnv("NEXT_PUBLIC_SANITY_DATASET", "SANITY_DATASET");
const apiVersion =
  resolveSanityEnv("NEXT_PUBLIC_SANITY_API_VERSION", "SANITY_API_VERSION") ||
  SANITY_API_VERSION_FALLBACK;
const token = process.env.SANITY_READ_TOKEN;

// When credentials are missing we still render the site, but log warnings so developers know why no content appears.
const missingKeys: string[] = [];

if (!projectId) {
  missingKeys.push("NEXT_PUBLIC_SANITY_PROJECT_ID");
}

if (!dataset) {
  missingKeys.push("NEXT_PUBLIC_SANITY_DATASET");
}

if (missingKeys.length > 0) {
  console.warn(
    `Sanity environment variables are missing (${missingKeys.join(", ")}). Sanity queries will return null until these values are provided.`,
  );
}

const hasSanityCredentials = Boolean(projectId && dataset);

const baseConfig: ClientConfig | null = hasSanityCredentials
  ? {
      projectId: projectId as string,
      dataset: dataset as string,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production" && !token,
      perspective: "published",
    }
  : null;

export const sanityConfig = baseConfig;

const client = baseConfig
  ? createClient({
      ...baseConfig,
      token,
    })
  : null;

type FetchOptions = {
  revalidate?: number;
  tags?: string[];
};

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  { revalidate = 60, tags = ["sanity"] }: FetchOptions = {},
): Promise<T | null> {
  if (!client) {
    console.warn("Sanity credentials are missing. Returning empty results.");
    return null;
  }

  try {
    return await client.fetch<T>(query, params, {
      cache: "force-cache",
      next: { revalidate, tags },
    });
  } catch (error) {
    console.error("Sanity fetch error", error);
    return null;
  }
}

export const sanityProjectDetails = {
  projectId: projectId ?? null,
  dataset: dataset ?? null,
};
