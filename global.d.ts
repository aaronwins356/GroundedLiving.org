declare module "next" {
  interface PageProps {
    params?: Record<string, string | string[] | undefined>;
    searchParams?: Record<string, string | string[] | undefined>;
  }

  interface Metadata {
    title?:
      | string
      | {
          default?: string;
          template?: string;
          absolute?: string;
        };
    description?: string;
    openGraph?: Record<string, unknown>;
    [key: string]: unknown;
  }

  namespace MetadataRoute {
    interface Robots {
      rules:
        | {
            userAgent: string | string[];
            allow?: string | string[];
            disallow?: string | string[];
          }
        | Array<{
            userAgent: string | string[];
            allow?: string | string[];
            disallow?: string | string[];
          }>;
      sitemap?: string | string[];
      host?: string;
    }

    interface SitemapEntry {
      url: string;
      lastModified?: string | Date;
      changefreq?: string;
      priority?: number;
    }

    type Sitemap = SitemapEntry[];
  }
}
