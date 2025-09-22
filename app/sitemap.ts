import type { MetadataRoute } from "next";

import { getPosts } from "../lib/sanity.queries";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.groundedliving.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/privacy",
    "/premium",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...staticRoutes, ...postEntries];
}
