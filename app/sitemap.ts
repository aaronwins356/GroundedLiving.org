import type { MetadataRoute } from "next";

import { getBlogPosts, getCategories, getPages } from "../lib/contentful";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.groundedliving.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([getBlogPosts(), getPages(), getCategories()]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.datePublished ?? new Date().toISOString(),
  }));

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.slug !== "home")
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date().toISOString(),
    }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date().toISOString(),
  }));

  const staticRoutes: MetadataRoute.Sitemap = ["", "/blog", "/shop"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...staticRoutes, ...pageEntries, ...categoryEntries, ...postEntries];
}
