// Global type declarations placeholder. Add shared ambient types here when needed.

declare module "gray-matter" {
  interface GrayMatterFile<T extends Record<string, unknown>> {
    data: T;
    content: string;
    excerpt?: string;
  }

  interface GrayMatterOptions<T extends Record<string, unknown>> {
    excerpt?: boolean | ((file: GrayMatterFile<T>) => void);
    excerpt_separator?: string;
  }

  export default function matter<T extends Record<string, unknown> = Record<string, unknown>>(
    input: string,
    options?: GrayMatterOptions<T>,
  ): GrayMatterFile<T>;
}

declare module "contentful-management" {
  interface ContentfulEntry {
    sys: { id: string };
    fields: Record<string, Record<string, unknown>>;
    publish(): Promise<ContentfulEntry>;
  }

  interface ContentfulEnvironment {
    getEntries(query: Record<string, unknown>): Promise<{ items: ContentfulEntry[] }>;
    createEntry(
      contentTypeId: string,
      data: { fields: Record<string, Record<string, unknown>> },
    ): Promise<ContentfulEntry>;
  }

  interface ContentfulSpace {
    getEnvironment(environmentId: string): Promise<ContentfulEnvironment>;
  }

  interface ContentfulClient {
    getSpace(spaceId: string): Promise<ContentfulSpace>;
  }

  export function createClient(config: { accessToken: string }): ContentfulClient;
}
