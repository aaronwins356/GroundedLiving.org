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
    sys: { id: string; updatedAt?: string; publishedVersion?: number };
    fields: Record<string, Record<string, unknown>>;
    publish(): Promise<ContentfulEntry>;
    update(): Promise<ContentfulEntry>;
    unpublish(): Promise<ContentfulEntry>;
    delete(): Promise<void>;
    isPublished(): boolean;
  }

  interface ContentfulEnvironment {
    getEntries(query?: Record<string, unknown>): Promise<{ items: ContentfulEntry[] }>;
    getEntry(entryId: string): Promise<ContentfulEntry>;
    createEntry(
      contentTypeId: string,
      data: { fields: Record<string, Record<string, unknown>> },
    ): Promise<ContentfulEntry>;
    getAssets(query?: Record<string, unknown>): Promise<{ items: ContentfulAsset[] }>;
    getContentTypes(query?: Record<string, unknown>): Promise<{ items: ContentfulContentType[] }>;
  }

  interface ContentfulSpace {
    getEnvironment(environmentId: string): Promise<ContentfulEnvironment>;
  }

  interface ContentfulClient {
    getSpace(spaceId: string): Promise<ContentfulSpace>;
  }

  interface ContentfulAsset {
    sys: { id: string; updatedAt?: string };
    fields: Record<string, Record<string, unknown>>;
    isPublished(): boolean;
    publish(): Promise<ContentfulAsset>;
    unpublish(): Promise<ContentfulAsset>;
    delete(): Promise<void>;
  }

  interface ContentfulContentType {
    sys: { id: string; updatedAt?: string };
    isPublished(): boolean;
    publish(): Promise<ContentfulContentType>;
    unpublish(): Promise<ContentfulContentType>;
    delete(): Promise<void>;
  }

  export type Environment = ContentfulEnvironment;

  export function createClient(config: { accessToken: string }): ContentfulClient;
}
