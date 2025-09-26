import type { MetadataRoute } from "next";

import { getAllBlogPosts, getCategories, getPages } from "@/lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";

const STATIC_ROUTES = ["/", "/about", "/contact", "/privacy", "/disclosure", "/journal", "/blog", "/shop"];

export async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([
    getAllBlogPosts(),
    getPages(),
    getCategories(),
  ]);

  const seen = new Set<string>();
  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    const url = canonicalFor(route).toString();
    if (!seen.has(url)) {
      seen.add(url);
      entries.push({ url, lastModified: now });
    }
  }

  for (const page of pages) {
    const slug = page.slug === "home" ? "/" : `/${page.slug}`;
    const url = canonicalFor(slug).toString();
    if (!seen.has(url)) {
      seen.add(url);
      entries.push({ url, lastModified: now });
    }
  }

  for (const category of categories) {
    const url = canonicalFor(`/categories/${category.slug}`).toString();
    if (!seen.has(url)) {
      seen.add(url);
      entries.push({ url, lastModified: now });
    }
  }

  for (const post of posts) {
    const url = canonicalFor(`/blog/${post.slug}`).toString();
    if (!seen.has(url)) {
      seen.add(url);
      entries.push({
        url,
        lastModified: post.datePublished ?? now,
      });
    }
  }

  return entries;
}

export default sitemap;
