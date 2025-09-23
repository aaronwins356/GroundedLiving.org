import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { Seo } from "@/components/seo/Seo";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import { getPageBySlug, getPages, buildAbsoluteUrl, CONTENTFUL_REVALIDATE_INTERVAL } from "@/lib/contentful";

export const revalidate = CONTENTFUL_REVALIDATE_INTERVAL;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return { title: "Page not found" };
  }

  const description = page.seoDescription ?? undefined;
  const canonical = buildAbsoluteUrl(`/pages/${page.slug}`);

  return {
    title: page.title,
    description,
    alternates: { canonical },
  };
}

export default async function MarketingPage({ params }: PageProps) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  const canonical = buildAbsoluteUrl(`/pages/${page.slug}`);

  return (
    <div className="section-shell space-y-10">
      <Seo title={page.title} description={page.seoDescription} canonical={canonical} openGraph={{ url: canonical, type: "website" }} />
      <header className="surface-card flex flex-col gap-4 px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-sage-500">Grounded Living</p>
        <h1 className="font-heading text-4xl text-[#3b443b]">{page.title}</h1>
        {page.seoDescription ? <p className="text-sm text-[#4c544c]">{page.seoDescription}</p> : null}
      </header>
      {page.heroImage ? (
        <div className="relative overflow-hidden rounded-[42px] shadow-[0_35px_90px_rgba(169,146,128,0.25)]">
          <Image
            src={page.heroImage.url}
            alt={page.heroImage.alt ?? page.title}
            width={page.heroImage.width ?? 1600}
            height={page.heroImage.height ?? 900}
            className="h-auto w-full object-cover"
            priority
            placeholder={page.heroImage.url.startsWith("data:") ? "blur" : undefined}
            blurDataURL={page.heroImage.url.startsWith("data:") ? page.heroImage.url : undefined}
          />
        </div>
      ) : null}
      <div className="surface-card article-prose px-8 py-10">
        <RichTextRenderer document={page.content} />
      </div>
      <NewsletterSignup
        endpoint={process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT}
        providerLabel={process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "newsletter"}
      />
    </div>
  );
}
