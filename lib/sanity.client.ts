import "server-only";
import { createClient, type ClientConfig } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2024-05-01";
const token = process.env.SANITY_READ_TOKEN;

if (!projectId) {
  throw new Error("❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in environment variables");
}
if (!dataset) {
  throw new Error("❌ Missing NEXT_PUBLIC_SANITY_DATASET in environment variables");
}

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production" && !token,
  perspective: "published",
  token,
};

export const client = createClient(config);

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: { revalidate?: number; tags?: string[] } = {}
): Promise<T> {
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { revalidate: options.revalidate ?? 60, tags: options.tags ?? ["sanity"] },
  });
}
