import "server-only";
import { createClient, type ClientConfig, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2024-05-01";
const token = process.env.SANITY_READ_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    `❌ Missing Sanity environment variables. Got projectId=${projectId}, dataset=${dataset}`
  );
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

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  { revalidate = 60, tags = ["sanity"] }: { revalidate?: number; tags?: string[] } = {}
): Promise<T> {
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { revalidate, tags },
  });
}
