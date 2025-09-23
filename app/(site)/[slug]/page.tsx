import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichTextRenderer } from "@components/content/RichTextRenderer";
import { NewsletterSignup } from "@components/marketing/NewsletterSignup";
import { getPageBySlug, getPages } from "@lib/contentful";
import seoConfig from "../../../next-seo.config";
import type { ContentfulPage } from "@project-types/contentful";

export const revalidate = 300;

interface GenericPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl;

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((page: ContentfulPage) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: GenericPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) {
    return {};
  }

  const description = page.content?.content?.[0]?.content?.[0]?.value?.slice(0, 160) ?? undefined;
  const canonicalUrl = `${siteUrl}/${page.slug}`;
  const ogImage = page.heroImage?.url
    ? {
        url: `${page.heroImage.url}?w=1200&h=630&fit=fill`,
        width: 1200,
        height: 630,
        alt: page.heroImage.description ?? page.heroImage.title ?? page.title,
      }
    : undefined;

  return {
    title: page.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: page.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page.title,
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

  const canonicalUrl = `${siteUrl}/${page.slug}`;
  const heroImage = page.heroImage?.url
    ? {
        url: `${page.heroImage.url}?w=1600&fit=fill`,
        alt: page.heroImage.description ?? page.heroImage.title ?? page.title,
        width: page.heroImage.width ?? 1600,
        height: page.heroImage.height ?? 900,
      }
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.content?.content?.[0]?.content?.[0]?.value ?? undefined,
    url: canonicalUrl,
    image: heroImage?.url ?? undefined,
  };

  return (
    <article className="page-layout">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(jsonLd)}
      </script>
      <header className="page-hero">
        <h1>{page.title}</h1>
        {heroImage ? (
          <figure className="page-hero-media">
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              width={heroImage.width}
              height={heroImage.height}
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
              className="page-hero-image"
            />
            {page.heroImage?.description ? <figcaption>{page.heroImage.description}</figcaption> : null}
          </figure>
        ) : null}
      </header>
      <RichTextRenderer document={page.content} />
      <NewsletterSignup />
    </article>
  );
}
