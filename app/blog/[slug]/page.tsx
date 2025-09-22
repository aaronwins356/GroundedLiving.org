import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SocialShareButtons } from "../../../components/blog/SocialShareButtons";
import { PortableTextRenderer } from "../../../components/rich-text/PortableTextRenderer";
import { getPageBySlug, getPostBySlug, getPosts } from "../../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../../lib/sanity.image";
import styles from "./page.module.css";

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
  const metaTitle = post.seo?.metaTitle || post.title;
  const metaDescription = post.seo?.metaDescription || post.excerpt || undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
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
    <article className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={post.coverImage?.alt ?? post.title}
              fill
              sizes="(min-width: 1024px) 1000px, 100vw"
              priority
            />
          ) : null}
        </div>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <div className={styles.heroMeta}>
            {post.category ? (
              <Link href={`/blog?category=${encodeURIComponent(post.category.slug)}`} className={styles.category}>
                {post.category.title}
              </Link>
            ) : (
              <span className={styles.category}>Mindful Living</span>
            )}
            <span>•</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
        </div>
      </section>

      <SocialShareButtons title={post.title} url={postUrl} />

      <div className={styles.layout}>
        <div className={styles.article}>
          <PortableTextRenderer value={post.content} />
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <span className={styles.sidebarEyebrow}>About the author</span>
            {aboutSnippet.length ? (
              <PortableTextRenderer value={aboutSnippet} />
            ) : (
              <p>
                Add an About page in Sanity to automatically introduce yourself beside each story.
              </p>
            )}
            <Link href="/about" className={styles.sidebarLink}>
              Read the full story →
            </Link>
          </div>
          <div className={styles.sidebarCard}>
            <span className={styles.sidebarEyebrow}>Mindful ad spot</span>
            <p>
              Reserve this space for aligned sponsors or affiliate partnerships. It keeps monetization present without disrupting the reading experience.
            </p>
          </div>
          <div className={styles.sidebarCard}>
            <span className={styles.sidebarEyebrow}>Categories</span>
            <Link href="/blog?category=lifestyle" className={styles.sidebarLink}>
              Lifestyle inspiration
            </Link>
            <Link href="/blog?category=movement" className={styles.sidebarLink}>
              Gentle movement
            </Link>
            <Link href="/blog?category=nutrition" className={styles.sidebarLink}>
              Nourishing recipes
            </Link>
          </div>
        </aside>
      </div>

      <div className={styles.footerNav}>
        <Link href="/blog" className={styles.footerBack}>
          ← Back to all posts
        </Link>
        <time dateTime={post.publishedAt} className={styles.footerDate}>
          {formattedDate}
        </time>
      </div>
    </article>
  );
}
