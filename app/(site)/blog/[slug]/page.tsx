import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@components/blog/PostCard";
import { NewsletterSignup } from "@components/marketing/NewsletterSignup";
import { RichTextRenderer } from "@components/content/RichTextRenderer";
import { getAllBlogPosts, getBlogPostBySlug } from "@lib/contentful";
import type { BlogPost, BlogPostSummary } from "@project-types/contentful";
import seoConfig from "../../../../next-seo.config";

export const revalidate = 300;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl;

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post: BlogPostSummary) => ({ slug: post.slug }));
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

function buildJsonLd(post: BlogPost, canonicalUrl: string) {
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

function findRelatedPosts(posts: BlogPostSummary[], current: BlogPostSummary | BlogPost) {
  return posts.filter((post) => post.slug !== current.slug).slice(0, 3);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  const posts = await getAllBlogPosts();
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
          {publishedDate ? <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString()}</time> : null}
          {post.author ? <span className="post-category">By {post.author.name}</span> : null}
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
        <section className="post-author">
          <h3>About the author</h3>
          <div className="post-author-card">
            {post.author?.avatarImage?.url ? (
              <Image
                src={`${post.author.avatarImage.url}?w=160&h=160&fit=fill`}
                alt={post.author?.name ?? post.title}
                width={160}
                height={160}
              />
            ) : null}
            <div>
              <h4>{post.author?.name ?? "Grounded Living"}</h4>
              {post.author?.bio ? <p>{post.author.bio}</p> : null}
            </div>
          </div>
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
