import "server-only";

import type { ClientConfig } from "@sanity/client";
import { createClient } from "next-sanity";

/**
 * Shared helper that reads Sanity environment variables while supporting both the legacy
 * server-only names and the new Next.js public variants expected by Vercel.
 */
function readSanityEnv(name: "SANITY_PROJECT_ID" | "SANITY_DATASET") {
  const legacy = process.env[name];
  const nextPublic = process.env[`NEXT_PUBLIC_${name}` as const];

  if (!legacy && !nextPublic && process.env.NODE_ENV !== "production") {
    console.warn(`${name} (or NEXT_PUBLIC_${name}) is missing. Sanity clients will be disabled.`);
  }

  return legacy || nextPublic || "";
}

const projectId = readSanityEnv("SANITY_PROJECT_ID");
const dataset = readSanityEnv("SANITY_DATASET") || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2024-05-01";
const token = process.env.SANITY_READ_TOKEN;

const baseConfig: ClientConfig | null =
  projectId && dataset
    ? {
        projectId,
        dataset,
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
