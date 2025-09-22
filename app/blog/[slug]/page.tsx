import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SocialShareButtons } from "../../../components/blog/SocialShareButtons";
import { PortableTextRenderer } from "../../../components/rich-text/PortableTextRenderer";
import { getPageBySlug, getPostBySlug, getPosts } from "../../../lib/sanity.queries";
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

  const [post, aboutPage] = await Promise.all([getPostBySlug(slug), getPageBySlug("about")]);

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
  const aboutSnippet = aboutPage?.content?.slice(0, 2) ?? [];
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  // Default to production domain so share URLs remain valid during local previews or misconfigured envs.
  const siteUrl = envSiteUrl && envSiteUrl.startsWith("http") ? envSiteUrl : "https://www.groundedliving.org";
  const postUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();

  return (
    <article className="space-y-16">
      <section className="overflow-hidden rounded-[2.75rem] shadow-soft-lg ring-1 ring-brand-100">
        <div className="relative h-[360px] overflow-hidden sm:h-[460px]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-accent/80 via-accent/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-10 text-white sm:p-14">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.3em]">
              {post.category ? (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-white transition hover:bg-white/30"
                >
                  {post.category}
                </Link>
              ) : (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-white">
                  Mindful Living
                </span>
              )}
              <span className="text-white/60">•</span>
              <time dateTime={post.publishedAt}>{formattedDate}</time>
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
          </div>
        </div>
      </section>

      <SocialShareButtons title={post.title} url={postUrl} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="prose prose-lg prose-brand max-w-none">
          <PortableTextRenderer value={post.content} />
        </div>
        <aside className="space-y-8 rounded-[2rem] border border-brand-100 bg-white/80 p-8 shadow-soft-lg">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">About the author</p>
            {aboutSnippet.length ? (
              <div className="prose prose-sm prose-brand max-w-none text-accent-soft">
                <PortableTextRenderer value={aboutSnippet} />
              </div>
            ) : (
              <p className="text-sm text-accent-soft">
                Add an About page in Sanity to automatically introduce yourself beside each story.
              </p>
            )}
            <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800">
              Read the full story
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="space-y-3 rounded-[1.75rem] border border-dashed border-brand-300 bg-brand-50/70 p-6 text-sm text-accent-soft">
            <p className="font-semibold uppercase tracking-[0.35em] text-brand-600">Mindful ad spot</p>
            <p>
              Reserve this space for aligned sponsors or affiliate partnerships. It keeps monetization present without disrupting the reading experience.
            </p>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-4 rounded-[2rem] border border-brand-100 bg-white/80 p-6 text-sm text-accent-soft sm:flex-row sm:items-center sm:justify-between">
        <Link href="/blog" className="font-semibold text-brand-700 transition hover:text-brand-800">
          ← Back to all posts
        </Link>
        <time dateTime={post.publishedAt} className="uppercase tracking-[0.3em] text-brand-600/80">
          {formattedDate}
        </time>
      </div>
    </article>
  );
}
