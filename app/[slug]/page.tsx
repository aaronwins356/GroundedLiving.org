import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichTextRenderer } from "../../components/content/RichTextRenderer";
import { NewsletterSignup } from "../../components/marketing/NewsletterSignup";
import { getPageBySlug, getPages } from "../../lib/contentful";

export const revalidate = 300;

interface GenericPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: GenericPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) {
    return {};
  }

  return {
    title: page.title,
    // We approximate an SEO description by grabbing the first text node from the
    // rich text document. Editors can override this directly inside Contentful
    // once the dedicated SEO fields are added.
    description: page.content?.content?.[0]?.content?.[0]?.value?.slice(0, 160),
  } satisfies Metadata;
}

export default async function GenericPage({ params }: GenericPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="page-layout">
      <header className="page-hero">
        <h1>{page.title}</h1>
      </header>
      <RichTextRenderer document={page.content} />
      <NewsletterSignup />
    </article>
  );
}
