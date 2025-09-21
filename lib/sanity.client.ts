import "server-only";

export const sanityConfig = {
  projectId: process.env.SANITY_PROJECT_ID ?? "local",
  dataset: process.env.SANITY_DATASET ?? "development",
  apiVersion: process.env.SANITY_API_VERSION ?? "2023-01-01",
  useCdn: true,
};

export const sanityClient = {
  async fetch<T>(_query: string, _params?: Record<string, unknown>): Promise<T> {
    // The local content pipeline replaces remote Sanity queries during offline builds.
    throw new Error("Sanity client fetch is not implemented in the local content setup.");
  },
};
