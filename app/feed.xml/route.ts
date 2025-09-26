import { NextResponse } from "next/server";

import { getAllBlogPosts } from "@/lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await getAllBlogPosts();
  const siteTitle = "Grounded Living";
  const siteDescription = "Soulful wellness rituals, nourishing recipes, and mindful lifestyle guidance.";
  const siteLink = siteUrl.toString().replace(/\/$/, "");
  const now = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const itemUrl = canonicalFor(`/blog/${post.slug}`).toString();
      const description = post.excerpt ?? "";
      const pubDate = post.datePublished ? new Date(post.datePublished).toUTCString() : now;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${escapeXml(pubDate)}</pubDate>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(siteLink)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-US</language>
    <lastBuildDate>${escapeXml(now)}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
