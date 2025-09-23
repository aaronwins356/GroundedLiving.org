import Image from "next/image";
import Link from "next/link";

import type { ContentfulBlogPost } from "../../types/contentful";

import styles from "./PostCard.module.css";

interface PostCardProps {
  post: ContentfulBlogPost;
}

export function PostCard({ post }: PostCardProps) {
  const publishedDate = post.datePublished ? new Date(post.datePublished) : null;
  const coverImage = post.coverImage?.url
    ? {
        src: `${post.coverImage.url}?w=800&h=600&fit=fill`,
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
            sizes="(min-width: 768px) 50vw, 100vw"
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden>
            <span>{post.title.slice(0, 1)}</span>
          </div>
        )}
      </Link>
      <div className={styles.content}>
        <div className={styles.meta}>
          {post.category ? <span className={styles.category}>{post.category.name}</span> : null}
          {publishedDate ? <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString()}</time> : null}
        </div>
        <h3 className={styles.title}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
        {post.tags.length ? (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
