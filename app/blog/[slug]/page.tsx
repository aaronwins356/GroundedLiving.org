import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PortableTextRenderer } from "../../../components/rich-text/PortableTextRenderer";
import { getPostBySlug, getPosts } from "../../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../../lib/sanity.image";

type BlogRouteParams = Record<string, string | string[] | undefined>;

type BlogPageProps = {
  /**
   * Next.js 15 passes route params as a promise to support streaming.
   * Awaiting the value maintains compatibility with synchronous callers at runtime.
   */
  params: Promise<BlogRouteParams>;
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  if (!slug) {
    return { title: "Post not found" };
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const coverImageUrl = post.coverImage && hasSanityImageAsset(post.coverImage)
    ? urlForImage(post.coverImage).width(1600).height(900).fit("crop").auto("format").url()
    : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt,
      images: coverImageUrl ? [coverImageUrl] : undefined,
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

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const coverImageUrl = post.coverImage && hasSanityImageAsset(post.coverImage)
    ? urlForImage(post.coverImage).width(2000).height(1200).fit("crop").auto("format").url()
    : null;
  const formattedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="space-y-16">
      <section className="overflow-hidden rounded-3xl shadow-soft-lg">
        <div className="relative h-[340px] overflow-hidden rounded-3xl sm:h-[420px]">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={post.coverImage?.alt ?? post.title}
              fill
              sizes="(min-width: 1024px) 1000px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-white to-brand-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-10 text-white sm:p-14">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.3em]">
              {post.category ? (
                <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-white transition hover:bg-white/30">
                  {post.category}
                </Link>
              ) : (
                <span>Mindful Living</span>
              )}
              <span className="text-white/60">•</span>
              <time dateTime={post.publishedAt}>{formattedDate}</time>
            </div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="prose prose-lg prose-brand max-w-none">
          <PortableTextRenderer value={post.content} />
        </div>
        <aside className="space-y-6 rounded-3xl bg-white/70 p-6 shadow-soft-lg">
          <h2 className="text-lg font-semibold text-accent">Recommended resources</h2>
          <p className="text-sm text-accent-soft">
            Curated affiliate-friendly products and rituals will live here once partnerships are active.
          </p>
          <ul className="space-y-4 text-sm text-accent-soft">
            <li>
              <Link href="/shop" className="font-medium text-brand-600 hover:text-brand-800">
                Calming Evening Tea Ritual
              </Link>
              <p>Slow down with a soothing blend and evening journal prompts.</p>
            </li>
            <li>
              <Link href="/shop" className="font-medium text-brand-600 hover:text-brand-800">
                Morning Breathwork Playlist
              </Link>
              <p>Audio guidance for gentle daily grounding.</p>
            </li>
          </ul>
          {/* This dedicated sidebar keeps affiliate ideas visible without interrupting the reading flow. */}
        </aside>
      </div>

      <div className="flex items-center justify-between rounded-3xl bg-white/60 p-6 text-sm text-accent-soft">
        <Link href="/blog" className="font-semibold text-brand-600 hover:text-brand-800">
          ← Back to all posts
        </Link>
        <time dateTime={post.publishedAt}>{formattedDate}</time>
      </div>
    </article>
  );
}
