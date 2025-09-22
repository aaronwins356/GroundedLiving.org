import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { PrismicRichText } from "../../../components/prismic/RichText";

import { SocialShareButtons } from "../../../components/blog/SocialShareButtons";
import type { ContentfulImage, ContentfulRichTextDocument, ContentfulRichTextNode } from "../../../lib/contentful";
import { getBlogPostBySlug, getBlogPosts } from "../../../lib/contentful";
import { getPageByUID } from "../../../lib/prismic";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

type BlogRouteParams = Record<string, string | string[] | undefined>;

type BlogPageProps = {
  params: Promise<BlogRouteParams>;
};

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function renderTextNode(node: ContentfulRichTextNode, key: string): ReactNode {
  const base = node.value ?? "";
  if (!node.marks?.length) {
    return base;
  }

  return node.marks.reduce<ReactNode>((acc, mark, index) => {
    switch (mark.type) {
      case "bold":
        return (
          <strong key={`${key}-bold-${index}`}>
            {acc}
          </strong>
        );
      case "italic":
        return (
          <em key={`${key}-italic-${index}`}>
            {acc}
          </em>
        );
      case "underline":
        return (
          <span key={`${key}-underline-${index}`} className="underline">
            {acc}
          </span>
        );
      case "code":
        return (
          <code key={`${key}-code-${index}`} className="rounded bg-slate-100 px-1 py-0.5 text-sm">
            {acc}
          </code>
        );
      default:
        return acc;
    }
  }, base);
}

function renderChildren(
  node: ContentfulRichTextNode,
  key: string,
  assets: Record<string, ContentfulImage>,
): ReactNode {
  return node.content?.map((child, index) => renderNode(child, `${key}-${index}`, assets)) ?? null;
}

// Minimal renderer so we can display Contentful rich text without an additional dependency bundle.
function renderNode(
  node: ContentfulRichTextNode,
  key: string,
  assets: Record<string, ContentfulImage>,
): ReactNode {
  switch (node.nodeType) {
    case "text":
      return <Fragment key={key}>{renderTextNode(node, key)}</Fragment>;
    case "paragraph":
      return <p key={key}>{renderChildren(node, key, assets)}</p>;
    case "heading-1":
      return (
        <h2 key={key} className="text-3xl">
          {renderChildren(node, key, assets)}
        </h2>
      );
    case "heading-2":
      return (
        <h3 key={key} className="text-2xl">
          {renderChildren(node, key, assets)}
        </h3>
      );
    case "heading-3":
      return (
        <h4 key={key} className="text-xl">
          {renderChildren(node, key, assets)}
        </h4>
      );
    case "heading-4":
      return (
        <h5 key={key} className="text-lg">
          {renderChildren(node, key, assets)}
        </h5>
      );
    case "heading-5":
    case "heading-6":
      return (
        <h6 key={key} className="text-base uppercase tracking-wide text-emerald-500">
          {renderChildren(node, key, assets)}
        </h6>
      );
    case "unordered-list":
      return (
        <ul key={key} className="list-disc pl-6">
          {renderChildren(node, key, assets)}
        </ul>
      );
    case "ordered-list":
      return (
        <ol key={key} className="list-decimal pl-6">
          {renderChildren(node, key, assets)}
        </ol>
      );
    case "list-item":
      return <li key={key}>{renderChildren(node, key, assets)}</li>;
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-4 border-emerald-200 pl-4 italic text-slate-600">
          {renderChildren(node, key, assets)}
        </blockquote>
      );
    case "hr":
      return <hr key={key} className="my-8 border-emerald-100" />;
    case "hyperlink": {
      const href = typeof node.data?.uri === "string" ? node.data.uri : "";
      const external = href ? isExternalUrl(href) : false;
      return (
        <a
          key={key}
          href={href}
          className="font-semibold text-emerald-600 underline transition hover:text-emerald-500"
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {renderChildren(node, key, assets)}
        </a>
      );
    }
    case "embedded-asset-block": {
      const assetId =
        typeof node.data?.target === "object" &&
        node.data?.target !== null &&
        typeof (node.data.target as { sys?: { id?: string } }).sys?.id === "string"
          ? (node.data.target as { sys: { id: string } }).sys.id
          : undefined;
      const asset = assetId ? assets[assetId] : undefined;
      if (!asset) {
        return null;
      }
      return (
        <figure key={key} className="my-10 space-y-3">
          <Image
            src={asset.url}
            alt={asset.alt ?? ""}
            width={asset.width ?? 1600}
            height={asset.height ?? 900}
            sizes="(min-width: 1024px) 800px, 100vw"
            className="h-auto w-full rounded-2xl object-cover"
          />
        </figure>
      );
    }
    default:
      return <Fragment key={key}>{renderChildren(node, key, assets)}</Fragment>;
  }
}

function renderRichText(
  document: ContentfulRichTextDocument | null,
  assets: Record<string, ContentfulImage>,
): ReactNode {
  if (!document) {
    return null;
  }

  return document.content.map((node, index) => renderNode(node, `node-${index}`, assets));
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    return { title: "Post not found" };
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }

  const metaTitle = post.title;
  const metaDescription = post.excerpt ?? post.description ?? undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
      images: post.coverImage?.url ? [post.coverImage.url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    notFound();
  }

  const [post, aboutPage] = await Promise.all([getBlogPostBySlug(slug), getPageByUID("about")]);

  if (!post) {
    notFound();
  }

  const formattedDate = dateFormatter.format(new Date(post.publishedAt));
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = envSiteUrl && envSiteUrl.startsWith("http") ? envSiteUrl : "https://www.groundedliving.org";
  const postUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();

  return (
    <article className="space-y-16 text-emerald-950">
      <header className="space-y-10">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-100 via-white to-rose-100 shadow-[0_60px_140px_rgba(150,170,160,0.18)] ring-1 ring-emerald-100/70">
          {post.coverImage?.url ? (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt ?? post.title}
              fill
              sizes="(min-width: 1280px) 1100px, 100vw"
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="h-[420px] w-full" />
          )}
        </div>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-500">
            {post.category ? (
              <Link
                href={`/blog?category=${encodeURIComponent(post.category.slug)}`}
                className="rounded-full bg-emerald-50 px-4 py-1 text-emerald-700"
              >
                {post.category.name}
              </Link>
            ) : null}
            <time dateTime={post.publishedAt} className="tracking-[0.32em] text-emerald-400">
              {formattedDate}
            </time>
          </div>
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-emerald-950 sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="text-lg leading-relaxed text-emerald-900/70">
              {post.excerpt}
            </p>
          ) : null}
          {post.tags.length ? (
            <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <SocialShareButtons title={post.title} url={postUrl} />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-emerald-950 prose-p:text-slate-700 prose-strong:text-emerald-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-500">
          {renderRichText(post.content, post.linkedAssets)}
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white/90 p-6 shadow-[0_30px_80px_rgba(160,180,170,0.16)] ring-1 ring-emerald-100/80">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
              About the author
            </span>
            {aboutPage ? (
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
                <PrismicRichText field={aboutPage.content?.slice(0, 2) ?? null} />
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                Create an About page in Prismic to introduce yourself beside each story.
              </p>
            )}
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700 transition hover:text-emerald-500"
            >
              Read the full story
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-rose-100/80 via-white to-emerald-100/80 p-6 shadow-[0_30px_80px_rgba(170,190,180,0.18)] ring-1 ring-emerald-100/80">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
              Mindful partner space
            </span>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Reserve this spot for aligned sponsors, affiliate offerings, or seasonal shop features.
            </p>
          </div>
          <div className="rounded-3xl bg-white/90 p-6 shadow-[0_30px_80px_rgba(170,190,180,0.18)] ring-1 ring-emerald-100/80">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
              Tags
            </span>
            {post.tags.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={`aside-${tag}`}
                    className="rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Add tags in Contentful to help readers explore related rituals.
              </p>
            )}
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/80 px-6 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-500 shadow-[0_24px_60px_rgba(170,190,180,0.16)] ring-1 ring-emerald-100/80">
        <Link href="/blog" className="transition hover:text-emerald-600">
          ← Back to all posts
        </Link>
        <time dateTime={post.publishedAt}>{formattedDate}</time>
      </div>
    </article>
  );
}
