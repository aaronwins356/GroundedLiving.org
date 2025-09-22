import "server-only";
import type { ClientConfig } from "@sanity/client";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2024-05-01";
const token = process.env.SANITY_READ_TOKEN;

if (!projectId) {
  console.error("❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in environment variables");
}
if (!dataset) {
  console.error("❌ Missing NEXT_PUBLIC_SANITY_DATASET in environment variables");
}

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
  { revalidate = 60, tags = ["sanity"] }: FetchOptions = {}
): Promise<T | null> {
  if (!client) {
    console.warn("⚠️ Sanity client not initialized. Returning null.");
    return null;
  }

  try {
    return await client.fetch<T>(query, params, {
      cache: "force-cache",
      next: { revalidate, tags },
    });
  } catch (error) {
    console.error("Sanity fetch error:", error);
    return null;
  }
}

export const sanityProjectDetails = {
  projectId: projectId ?? null,
  dataset: dataset ?? null,
};
