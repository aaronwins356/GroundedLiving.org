export interface SanityClient {
  fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
}

export interface SanityClientConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn?: boolean;
  token?: string;
  perspective?: "published" | "previewDrafts";
}

export declare function createClient(config: SanityClientConfig): SanityClient;

export declare function groq(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string;
