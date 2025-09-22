import "server-only";
import { createClient, type ClientConfig, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2024-05-01";
const token = process.env.SANITY_READ_TOKEN;

const missingEnv: string[] = [];
if (!projectId) {
  missingEnv.push("NEXT_PUBLIC_SANITY_PROJECT_ID");
}
if (!dataset) {
  missingEnv.push("NEXT_PUBLIC_SANITY_DATASET");
}

const config: ClientConfig | null = missingEnv.length === 0
  ? {
      projectId: projectId!,
      dataset: dataset!,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production" && !token,
      perspective: "published",
      token,
    }
  : null;

const client: SanityClient | null = config ? createClient(config) : null;

if (!client) {
  const formattedList = missingEnv.join(", ");
  const message = `❌ Missing Sanity environment variables: ${formattedList}. Content queries will use provided fallbacks.`;
  if (process.env.NODE_ENV === "production") {
    console.error(message);
  } else {
    console.warn(message);
  }
}

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

  if (!client) {
    if (fallback !== undefined) {
      // When environment variables are missing during local builds/tests we fall back to caller-provided data
      // so the site can render without hard failing. Production deploys should provide real credentials.
      return fallback;
    }
    throw new Error("Sanity client is unavailable and no fallback value was provided for fetchSanity().");
  }

  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { revalidate: revalidate ?? 60, tags: tags ?? ["sanity"] },
  });
}
