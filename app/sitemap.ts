import type { MetadataRoute } from "next";

import { getCategories, getPages, getPosts, buildAbsoluteUrl } from "@/lib/contentful";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.groundedliving.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([getPosts(), getPages(), getCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/journal"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  const postEntries = posts.map((post) => ({
    url: buildAbsoluteUrl(`/posts/${post.slug}`),
    lastModified: post.date,
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
