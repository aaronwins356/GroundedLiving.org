import type { MetadataRoute } from "next";

import { getCategories, getPages, getBlogPosts, buildAbsoluteUrl } from "@/lib/contentful";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.groundedliving.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([getBlogPosts(), getPages(), getCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/blog", "/categories"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  const postEntries = posts.map((post) => ({
    url: buildAbsoluteUrl(`/blog/${post.slug}`),
    lastModified: post.datePublished,
  }));

  const pageEntries = pages.map((page) => ({
    url: buildAbsoluteUrl(`/pages/${page.slug}`),
    lastModified: new Date().toISOString(),
  }));

  const categoryEntries = categories.map((category) => ({
    url: buildAbsoluteUrl(`/categories/${category.slug}`),
    lastModified: new Date().toISOString(),
  }));

  return [...staticRoutes, ...postEntries, ...pageEntries, ...categoryEntries];
}
