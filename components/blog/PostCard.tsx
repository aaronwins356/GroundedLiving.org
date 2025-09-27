import Image from "next/image";
import Link from "next/link";

import type { BlogPostSummary } from "../../types/contentful";
import { buildContentfulImageUrl } from "@/lib/images";

import styles from "./PostCard.module.css";

interface PostCardProps {
  post: BlogPostSummary;
}

export function PostCard({ post }: PostCardProps) {
  const publishedDate = post.datePublished ? new Date(post.datePublished) : null;
  const coverImage = post.coverImage?.url
    ? {
        src: buildContentfulImageUrl(post.coverImage.url, { width: 800, height: 600, fit: "fill" }),
        alt: post.coverImage.description ?? post.coverImage.title ?? post.title,
      }
    : null;

  return (
    <article className={styles.card}>
      <Link href={`/blog/${post.slug}`} className={styles.coverLink}>
        {coverImage ? (
          <Image
            src={coverImage.src}
            alt={coverImage.alt}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            loading="lazy"
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden>
            <span>{post.title.slice(0, 1)}</span>
          </div>
        )}
      </Link>
      <div className={styles.content}>
        {publishedDate ? (
          <div className={styles.meta}>
            <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString()}</time>
          </div>
        ) : null}
        <h3 className={styles.title}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
