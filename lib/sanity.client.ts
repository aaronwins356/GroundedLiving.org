import "server-only";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? "2023-10-01";
const token = process.env.SANITY_READ_TOKEN;

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
} as const;

async function requestSanityApi<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!projectId || !dataset) {
    console.warn("Sanity credentials are missing. Returning empty results.");
    return null;
  }

  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, params }),
      // Cache responses for a minute to keep the experience snappy while still reflecting new content quickly.
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("Failed to query Sanity", await response.text());
      return null;
    }

    const data = (await response.json()) as { result?: T };
    return data.result ?? null;
  } catch (error) {
    console.error("Sanity fetch error", error);
    return null;
  }
}

export async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  return requestSanityApi<T>(query, params);
}
