import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleShell } from "@/components/blog/ArticleShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { AuthorCard } from "@/components/site/AuthorCard";
import { ContactForm } from "@/components/site/ContactForm";
import { getAllPageSlugs, getAuthorBySlug, getPageBySlug } from "@/lib/cms";
import { canonicalFor, metaFromRichTextExcerpt } from "@/lib/seo/meta";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";
import { ogImageForTitle } from "@/lib/seo/og";
import { breadcrumbList as buildBreadcrumbList, webPageSchema } from "@/lib/seo/schema";
import { RichText } from "@/lib/richtext";
import seoConfig from "../../../next-seo.config";

export const revalidate = 300;

interface GenericPageProps {
  params: Promise<{ slug: string }>;
}

const PRIMARY_AUTHOR_SLUG = "aaron-winstead";

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

  const path = page.slug === "home" ? "/" : `/${page.slug}`;
  const excerpt = metaFromRichTextExcerpt(page.bodyRichText, 160);
  const rawDescription =
    page.seoDescription?.trim() ??
    (excerpt || undefined) ??
    seoConfig.defaultDescription;
  const description = truncateAtBoundary(rawDescription, 155);
  const metaTitle = buildMetaTitle(page.seoTitle ?? page.title);
  const canonicalUrl = canonicalFor(path).toString();
  const ogImage = page.ogImage?.url
    ? {
        url: page.ogImage.url,
        width: page.ogImage.width ?? 1200,
        height: page.ogImage.height ?? 630,
        alt: page.ogImage.description ?? page.ogImage.title ?? metaTitle,
      }
    : null;
  const ogImages = ogImage
    ? [ogImage]
    : [
        {
          url: ogImageForTitle(metaTitle, {
            subtitle: description,
            eyebrow: page.slug === "contact" ? "Connect" : "Guide",
            variant: "editorial",
          }),
        },
      ];

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: metaTitle,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: ogImages.map((image) => image.url),
    },
  } satisfies Metadata;
}

export default async function GenericPage({ params }: GenericPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const path = page.slug === "home" ? "/" : `/${page.slug}`;
  const canonicalUrl = canonicalFor(path).toString();
  const excerpt = metaFromRichTextExcerpt(page.bodyRichText, 160);
  const rawDescription =
    page.seoDescription?.trim() ??
    (excerpt || undefined) ??
    seoConfig.defaultDescription;
  const description = truncateAtBoundary(rawDescription, 155);
  const breadcrumbItems = [
    { href: canonicalFor("/").toString(), label: "Home" },
    { href: canonicalUrl, label: page.title },
  ];
  const breadcrumbJsonLd = buildBreadcrumbList(breadcrumbItems);

  const schema = webPageSchema({
    name: page.seoTitle ?? page.title,
    url: canonicalUrl,
    description,
    breadcrumb: breadcrumbJsonLd ?? undefined,
  });

  const author = page.slug === "about" ? await getAuthorBySlug(PRIMARY_AUTHOR_SLUG) : null;

  return (
    <ArticleShell className="page-shell" innerClassName="prose page-article">
      <JsonLd item={schema} id="webpage-schema" />
      <JsonLd item={breadcrumbJsonLd} id="breadcrumb-schema" />
      <Breadcrumbs items={breadcrumbItems} />
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
