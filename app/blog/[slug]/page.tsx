import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AffiliateDisclosure } from "../../../components/blog/AffiliateDisclosure";
import { PostCard } from "../../../components/blog/PostCard";
import { NewsletterSignup } from "../../../components/marketing/NewsletterSignup";
import { RichTextRenderer } from "../../../components/content/RichTextRenderer";
import { getBlogPostBySlug, getBlogPosts } from "../../../lib/contentful";
import type { ContentfulBlogPost } from "../../../types/contentful";
import seoConfig from "../../../next-seo.config";

export const revalidate = 300;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

async function resolvePost(slug: string) {
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }
  return post;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return {};
  }

  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const imageUrl = post.coverImage?.url ? `${post.coverImage.url}?w=1200&h=630&fit=fill` : "/og-image.svg";
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.datePublished ?? undefined,
      tags: post.tags,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.coverImage?.description ?? post.coverImage?.title ?? post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
    },
  } satisfies Metadata;
}

function buildJsonLd(post: ContentfulBlogPost, canonicalUrl: string) {
  const datePublished = post.datePublished ?? new Date().toISOString();
  // Encode core metadata so Google understands the editorial context of each post.
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    datePublished,
    dateModified: datePublished,
    image: post.coverImage?.url ?? undefined,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          description: post.author.bio ?? undefined,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Grounded Living",
      logo: {
        "@type": "ImageObject",
        url: "https://www.groundedliving.org/og-image.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };
}

function findRelatedPosts(posts: ContentfulBlogPost[], current: ContentfulBlogPost) {
  return posts
    .filter((post) => post.slug !== current.slug)
    .filter((post) => post.category?.slug === current.category?.slug)
    .slice(0, 3);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  const posts = await getBlogPosts();
  const related = findRelatedPosts(posts, post);
  const publishedDate = post.datePublished ? new Date(post.datePublished) : null;
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const coverImage = post.coverImage?.url
    ? {
        src: `${post.coverImage.url}?w=1600&fit=fill`,
        alt: post.coverImage.description ?? post.coverImage.title ?? post.title,
        width: post.coverImage.width ?? 1600,
        height: post.coverImage.height ?? 900,
      }
    : null;

  return (
    <article className="post-layout">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(buildJsonLd(post, canonicalUrl))}
      </script>
      <header className="post-hero">
        <div className="post-meta">
          {post.category ? <span className="post-category">{post.category.name}</span> : null}
          {post.sponsored ? <span className="post-sponsored">{post.sponsoredLabel ?? "Sponsored"}</span> : null}
          {publishedDate ? <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString()}</time> : null}
        </div>
        <h1>{post.title}</h1>
        {post.excerpt ? <p className="post-excerpt">{post.excerpt}</p> : null}
        {coverImage ? (
          <figure className="post-cover">
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              width={coverImage.width}
              height={coverImage.height}
              sizes="(min-width: 1024px) 960px, 100vw"
              priority
              className="post-cover-image"
            />
            {post.coverImage?.description ? <figcaption>{post.coverImage.description}</figcaption> : null}
          </figure>
        ) : null}
      </header>
      <div className="post-body">
        <RichTextRenderer document={post.content} />
        {post.affiliate ? (
          <AffiliateDisclosure ctaText={post.affiliateCtaText} ctaUrl={post.affiliateCtaUrl ?? undefined} />
        ) : null}
        <section className="post-author">
          <h3>About the author</h3>
          <div className="post-author-card">
            {post.author?.avatarImage?.url ? (
              <img src={`${post.author.avatarImage.url}?w=160&h=160&fit=fill`} alt={post.author.name} />
            ) : null}
            <div>
              <h4>{post.author?.name ?? "Grounded Living"}</h4>
              {post.author?.bio ? <p>{post.author.bio}</p> : null}
            </div>
          </div>
        </section>
        <section className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </section>
      </div>
      <NewsletterSignup title="Never miss a grounding ritual" />
      {related.length > 0 ? (
        <section className="related-posts">
          <h2>Related posts</h2>
          <div className="related-grid">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
