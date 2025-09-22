import "server-only";
import { createClient, type ClientConfig, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2024-05-01";
const token = process.env.SANITY_READ_TOKEN;

if (!projectId) {
  throw new Error("❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
}

if (!dataset) {
  throw new Error("❌ Missing NEXT_PUBLIC_SANITY_DATASET");
}

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production" && !token,
  perspective: "published",
  token,
};

export const client: SanityClient = createClient(config);

export type FetchSanityOptions<T> = {
  revalidate?: number;
  tags?: string[];
  fallback?: T;
};

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: FetchSanityOptions<T> = {},
): Promise<T> {
  const { revalidate, tags, fallback } = options;

  try {
    return await client.fetch<T>(query, params, {
      cache: "force-cache",
      next: { revalidate: revalidate ?? 60, tags: tags ?? ["sanity"] },
    });
  } catch (error) {
    console.error("Sanity fetch error", error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}
