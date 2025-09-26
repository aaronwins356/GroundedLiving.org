import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleShell } from "@/components/blog/ArticleShell";
import { AuthorCard } from "@/components/site/AuthorCard";
import { ContactForm } from "@/components/site/ContactForm";
import { getAllPageSlugs, getAuthorBySlug, getPageBySlug } from "@/lib/cms";
import { RichText, richTextToPlainText } from "@/lib/richtext";
import seoConfig from "../../../next-seo.config";

export const revalidate = 300;

interface GenericPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl;
const PRIMARY_AUTHOR_SLUG = "aaron-winstead";

const truncate = (value: string, limit: number) => {
  if (!value) {
    return value;
  }

  if (value.length <= limit) {
    return value;
  }

  const sliced = value.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : limit).trimEnd()}…`;
};

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GenericPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {};
  }

  const bodyText = richTextToPlainText(page.bodyRichText);
  const description = page.seoDescription ?? truncate(bodyText, 160) ?? seoConfig.defaultDescription;
  const metaTitle = page.seoTitle ?? page.title;
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/${page.slug}`;
  const ogImage = page.ogImage?.url
    ? {
        url: page.ogImage.url,
        width: page.ogImage.width ?? 1200,
        height: page.ogImage.height ?? 630,
        alt: page.ogImage.description ?? page.ogImage.title ?? metaTitle,
      }
    : undefined;

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: metaTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: metaTitle,
      description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  } satisfies Metadata;
}

export default async function GenericPage({ params }: GenericPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/${page.slug}`;
  const bodyText = richTextToPlainText(page.bodyRichText);
  const description = page.seoDescription ?? truncate(bodyText, 160) ?? seoConfig.defaultDescription;

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title,
        item: canonicalUrl,
      },
    ],
  } as const;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seoTitle ?? page.title,
    headline: page.title,
    description,
    url: canonicalUrl,
  } as const;

  const author = page.slug === "about" ? await getAuthorBySlug(PRIMARY_AUTHOR_SLUG) : null;

  return (
    <ArticleShell className="page-shell" innerClassName="prose page-article">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(breadcrumbList)}
      </script>
      <h1>{page.title}</h1>
      <RichText document={page.bodyRichText} withProse={false} className="page-richtext" />
      {page.slug === "contact" ? (
        <div className="not-prose">
          <ContactForm />
        </div>
      ) : null}
      {page.slug === "about" && author ? (
        <div className="not-prose">
          <AuthorCard
            name={author.name}
            headshotUrl={author.headshotUrl ?? undefined}
            links={author.socialLinks ?? undefined}
            bioRichText={author.bioRichText}
          />
        </div>
      ) : null}
    </ArticleShell>
  );
}
