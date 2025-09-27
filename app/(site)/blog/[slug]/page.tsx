import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AffiliateDisclosure } from "@/components/blog/AffiliateDisclosure";
import { PostCard } from "@components/blog/PostCard";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { NewsletterSignup } from "@components/marketing/NewsletterSignup";
import { JsonLd } from "@/components/seo/JsonLd";
import { autoLinkHtml } from "@/lib/internalLinks";
import { getAllBlogPosts, getBlogPostBySlug } from "@lib/contentful";
import { buildContentfulImageUrl } from "@lib/images";
import { canonicalFor } from "@/lib/seo/meta";
import { breadcrumbList } from "@/lib/seo/schema";
import { buildArticleJsonLd, buildRecipeJsonLd, resolvePostMeta } from "@/lib/seo/post";
import { richTextToHtml } from "@/lib/richtext";
import type { BlogPost, BlogPostSummary } from "@project-types/contentful";

export const revalidate = 300;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

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

  const canonicalUrl = canonicalFor(`/blog/${post.slug}`).toString();
  const meta = resolvePostMeta(post);
  const image = meta.image;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      publishedTime: meta.publishedTime ?? undefined,
      modifiedTime: meta.modifiedTime ?? undefined,
      url: canonicalUrl,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
      authors: [meta.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [image.url],
    },
  } satisfies Metadata;
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
  const canonicalUrl = canonicalFor(`/blog/${post.slug}`).toString();
  const meta = resolvePostMeta(post);
  const breadcrumbItems = [
    { href: canonicalFor("/").toString(), label: "Home" },
    { href: canonicalFor("/blog").toString(), label: "Journal" },
    { href: canonicalUrl, label: post.title },
  ];
  const breadcrumbSchema = breadcrumbList(breadcrumbItems);
  const coverImage = post.coverImage?.url
    ? {
        src: buildContentfulImageUrl(post.coverImage.url, { width: 1600, fit: "fill" }),
        alt: post.coverImage.description ?? post.coverImage.title ?? post.title,
        width: post.coverImage.width ?? 1600,
        height: post.coverImage.height ?? 900,
      }
    : null;
  const rawHtml = richTextToHtml(post.content);
  const html = post.disableAutoLinks ? rawHtml : autoLinkHtml(rawHtml);
  const articleJsonLd = buildArticleJsonLd(post, {
    canonicalUrl,
    title: meta.title,
    description: meta.description,
    imageUrl: meta.image.url,
    breadcrumb: breadcrumbSchema,
    authorName: meta.authorName,
    publishedTime: meta.publishedTime,
    modifiedTime: meta.modifiedTime,
  });
  const recipeJsonLd = buildRecipeJsonLd(post, {
    canonicalUrl,
    title: meta.title,
    description: meta.description,
    imageUrl: meta.image.url,
    authorName: meta.authorName,
    datePublished: meta.publishedTime,
  });

  return (
    <article className="post-layout">
      <JsonLd item={articleJsonLd} id="article-schema" />
      <JsonLd item={recipeJsonLd} id="recipe-schema" />
      <JsonLd item={breadcrumbSchema} id="article-breadcrumb-schema" />
      <Breadcrumbs items={breadcrumbItems} />
      <header className="post-hero">
        <div className="post-meta">
          {publishedDate ? <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString()}</time> : null}
          {post.author ? <span className="post-category">By {post.author.name}</span> : null}
        </div>
        <h1>{post.title}</h1>
        {post.excerpt ? <p className="post-excerpt">{post.excerpt}</p> : null}
        {post.disclosureNeeded ? (
          <div className="not-prose">
            <AffiliateDisclosure ctaText={post.affiliateCtaText} ctaUrl={post.affiliateCtaUrl ?? undefined} />
          </div>
        ) : null}
        {coverImage ? (
          <figure className="post-cover">
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              width={coverImage.width}
              height={coverImage.height}
              sizes="(min-width: 1024px) 960px, 100vw"
              priority
              fetchPriority="high"
              className="post-cover-image"
            />
            {post.coverImage?.description ? <figcaption>{post.coverImage.description}</figcaption> : null}
          </figure>
        ) : null}
      </header>
      <div className="post-body">
        <div className="prose rt-container" dangerouslySetInnerHTML={{ __html: html }} />
        <section className="post-author">
          <h3>About the author</h3>
          <div className="post-author-card">
            {post.author?.avatarImage?.url ? (
              <Image
                src={buildContentfulImageUrl(post.author.avatarImage.url, {
                  width: 160,
                  height: 160,
                  fit: "thumb",
                })}
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
