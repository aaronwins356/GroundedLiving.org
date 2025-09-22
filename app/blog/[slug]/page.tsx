import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrismicRichText } from "@prismicio/react";

import { SocialShareButtons } from "../../../components/blog/SocialShareButtons";
import { getPageByUID, getPostByUID, getPosts } from "../../../lib/prismic";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

type BlogRouteParams = Record<string, string | string[] | undefined>;

type BlogPageProps = {
  params: Promise<BlogRouteParams>;
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.uid }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    return { title: "Post not found" };
  }

  const post = await getPostByUID(slug);
  if (!post) {
    return { title: "Post not found" };
  }

  const metaTitle = post.title;
  const metaDescription = post.excerpt ?? undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
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

  const [post, aboutPage] = await Promise.all([getPostByUID(slug), getPageByUID("about")]);

  if (!post) {
    notFound();
  }

  const formattedDate = dateFormatter.format(new Date(post.publishedAt));
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = envSiteUrl && envSiteUrl.startsWith("http") ? envSiteUrl : "https://www.groundedliving.org";
  const postUrl = new URL(`/blog/${post.uid}`, siteUrl).toString();

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
        </div>
      </header>

      <SocialShareButtons title={post.title} url={postUrl} />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-emerald-950 prose-p:text-slate-700 prose-strong:text-emerald-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-500">
          <PrismicRichText field={post.content} />
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
              Categories
            </span>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/blog?category=rituals"
                className="rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
              >
                Rituals
              </Link>
              <Link
                href="/blog?category=recipes"
                className="rounded-full bg-rose-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
              >
                Recipes
              </Link>
              <Link
                href="/blog?category=lifestyle"
                className="rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
              >
                Lifestyle
              </Link>
            </div>
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
