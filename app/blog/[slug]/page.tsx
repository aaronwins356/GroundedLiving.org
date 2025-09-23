import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { RelatedSidebar } from "@/components/sections/RelatedSidebar";
import { PrismHighlighter } from "@/components/ui/PrismHighlighter";
import { Seo } from "@/components/seo/Seo";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import {
  getBlogPostBySlug,
  getBlogPosts,
  getRelatedBlogPosts,
  buildAbsoluteUrl,
  formatDate,
  CONTENTFUL_REVALIDATE_INTERVAL,
} from "@/lib/contentful";

export const revalidate = CONTENTFUL_REVALIDATE_INTERVAL;

interface PostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return { title: "Post not found" };
  }

  const description = post.seoDescription ?? post.excerpt ?? "A soulful reflection from Grounded Living.";
  const canonical = buildAbsoluteUrl(`/blog/${post.slug}`);
  const ogImage = post.coverImage?.url
    ? [
        {
          url: post.coverImage.url,
          alt: post.coverImage.alt ?? post.title,
        },
      ]
    : undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical,
      publishedTime: post.datePublished,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImage,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedBlogPosts(post, 3);

  const shareUrl = buildAbsoluteUrl(`/blog/${post.slug}`);
  const shareTitle = post.title;
  const shareDescription = post.excerpt ?? post.seoDescription ?? "Grounded Living blog post";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    datePublished: post.datePublished,
    image: post.coverImage?.url,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Grounded Living",
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteUrl("/og-image.svg"),
      },
    },
    mainEntityOfPage: shareUrl,
  };

  return (
    <article className="section-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Seo
        title={post.title}
        description={post.seoDescription ?? post.excerpt}
        canonical={shareUrl}
        openGraph={{ url: shareUrl, images: post.coverImage ? [{ url: post.coverImage.url, alt: post.coverImage.alt ?? post.title }] : undefined, publishedTime: post.datePublished }}
      />
      <PrismHighlighter />
      <div className="space-y-10">
        <header className="flex flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-sage-500">{post.category?.name ?? "Journal"}</p>
          <h1 className="font-heading text-4xl leading-tight text-[#3b443b] sm:text-5xl">{post.title}</h1>
          <p className="text-sm text-[#4c544c]">
            {formatDate(post.datePublished)}
            {post.author ? ` · ${post.author.name}` : null}
          </p>
          {post.affiliate ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-100/60 px-6 py-4 text-xs text-[#704848]">
              This article contains curated affiliate links to wellness tools we genuinely adore. Purchases may support Grounded
              Living at no additional cost to you.
            </div>
          ) : null}
        </header>
        {post.coverImage ? (
          <div className="relative overflow-hidden rounded-[42px] shadow-[0_35px_90px_rgba(169,146,128,0.25)]">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt ?? post.title}
              width={post.coverImage.width ?? 1440}
              height={post.coverImage.height ?? 960}
              className="h-auto w-full object-cover"
              priority
              placeholder={post.coverImage.url.startsWith("data:") ? "blur" : undefined}
              blurDataURL={post.coverImage.url.startsWith("data:") ? post.coverImage.url : undefined}
            />
          </div>
        ) : null}
        <div className="surface-card article-prose px-8 py-10">
          <RichTextRenderer document={post.content} assets={post.assets} />
        </div>
        <ShareBar
          url={shareUrl}
          title={shareTitle}
          description={shareDescription}
          tags={post.tags}
        />
        <section className="surface-card flex flex-col gap-4 px-6 py-6 text-center">
          <h2 className="font-heading text-xl text-[#3b443b]">Partner Spotlight</h2>
          <p className="text-sm text-[#4c544c]">
            Showcase a featured sponsor or community collaborator here. Update via Contentful to keep partnerships fresh.
          </p>
          <Link
            href="/pages/contact"
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-sage-600"
          >
            Book a sponsorship
          </Link>
        </section>
        <NewsletterSignup
          endpoint={process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT}
          providerLabel={process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "newsletter"}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </div>
      <RelatedSidebar posts={related} />
    </article>
  );
}

type ShareBarProps = {
  url: string;
  title: string;
  description: string;
  tags: string[];
};

function ShareBar({ url, title, description, tags }: ShareBarProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  return (
    <div className="share-bar surface-card flex flex-wrap items-center justify-between gap-4 px-6 py-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-sage-500">Share this ritual</p>
        <p className="font-heading text-xl text-[#3b443b]">Know someone who needs this today?</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ShareButton href={twitterUrl} label="Twitter" />
        <ShareButton href={linkedinUrl} label="LinkedIn" />
        <ShareButton href={facebookUrl} label="Facebook" />
      </div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-sage-400">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-sage-100/80 px-3 py-1">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ShareButtonProps = {
  href: string;
  label: string;
};

function ShareButton({ href, label }: ShareButtonProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-sage-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sage-500 transition hover:border-sage-400 hover:bg-sage-100/80 hover:text-sage-600"
    >
      {label}
    </Link>
  );
}
