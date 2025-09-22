import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { PostListItem } from "../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../lib/sanity.image";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: PostListItem;
};

export function PostCard({ post }: PostCardProps) {
  const coverImageUrl = hasSanityImageAsset(post.coverImage)
    ? urlForImage(post.coverImage).width(900).height(600).fit("crop").auto("format").url()
    : null;

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const category = post.category;
  const badgeStyle: CSSProperties | undefined = category?.color
    ? { backgroundColor: `${category.color}33`, color: category.color }
    : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={post.coverImage?.alt ?? post.title}
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
          />
        ) : null}
        <div className={styles.badgeRow}>
          {category ? (
            <Link href={`/blog?category=${encodeURIComponent(category.slug)}`} className={styles.badge} style={badgeStyle}>
              {category.title}
            </Link>
          ) : (
            <span className={styles.badge}>Mindful Living</span>
          )}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span>Read</span>
        </div>
        <h2 className={styles.title}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
        <div className={styles.footer}>
          <Link href={`/blog/${post.slug}`} className={styles.readMore}>
            Read story <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
