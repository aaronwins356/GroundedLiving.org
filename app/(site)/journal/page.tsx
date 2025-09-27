import type { Metadata } from "next";
import Link from "next/link";

import { ArticleShell } from "@/components/blog/ArticleShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllBlogPosts } from "@/lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";
import { ogImageForTitle } from "@/lib/seo/og";
import { webPageSchema } from "@/lib/seo/schema";

const PAGE_TITLE = "Journal";
const META_TITLE = buildMetaTitle(PAGE_TITLE);
const PAGE_DESCRIPTION = truncateAtBoundary(
  "Discover soulful wellness rituals, seasonal recipes, and mindful living tips from the Grounded Living editorial team.",
  155,
);

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const canonicalUrl = canonicalFor("/journal").toString();
  const ogImageUrl = ogImageForTitle(PAGE_TITLE);

  return {
    title: META_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: META_TITLE,
      description: PAGE_DESCRIPTION,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: META_TITLE,
      description: PAGE_DESCRIPTION,
      images: [ogImageUrl],
    },
  } satisfies Metadata;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function JournalPage() {
  const posts = await getAllBlogPosts();
  const canonicalUrl = canonicalFor("/journal").toString();

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: canonicalFor("/").toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: PAGE_TITLE,
        item: canonicalUrl,
      },
    ],
  } as const;

  const schema = webPageSchema({
    name: PAGE_TITLE,
    url: canonicalUrl,
    description: PAGE_DESCRIPTION,
    breadcrumb: breadcrumbList,
  });

  return (
    <ArticleShell className="page-shell" innerClassName="prose page-article">
      <JsonLd item={schema} id="journal-schema" />
      <JsonLd item={breadcrumbList} id="journal-breadcrumb-schema" />
      <h1>{PAGE_TITLE}</h1>
      <p>{PAGE_DESCRIPTION}</p>
      <div className="not-prose">
        {posts.length > 0 ? (
          <ul className="mt-10 space-y-8">
            {posts.map((post) => {
              const published = formatDate(post.datePublished ?? null);
              const href = `/blog/${post.slug}`;
              const summary = post.excerpt ?? "";
              return (
                <li key={post.slug} className="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
                  <div className="flex flex-col gap-2">
                    {published ? <span className="text-sm font-medium uppercase tracking-wide text-moss">{published}</span> : null}
                    <Link href={href} className="text-2xl font-semibold text-ink hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-moss">
                      {post.title}
                    </Link>
                    {summary ? <p className="text-base text-ink/80">{summary}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-10 text-base text-ink/70">
            Fresh stories are brewing. Check back soon for the latest rituals and reflections.
          </p>
        )}
      </div>
    </ArticleShell>
  );
}
