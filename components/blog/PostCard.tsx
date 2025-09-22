import Image from "next/image";
import Link from "next/link";

import type { BlogPostListItem } from "../../lib/contentful";

type PostCardProps = {
  post: BlogPostListItem;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function PostCard({ post }: PostCardProps) {
  const publishedLabel = dateFormatter.format(new Date(post.publishedAt));

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/90 shadow-[0_25px_60px_rgba(134,160,142,0.15)] ring-1 ring-emerald-100/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(134,160,142,0.22)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-rose-100 via-slate-50 to-emerald-100/60">
        {post.coverImage?.url ? (
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            fill
            sizes="(min-width: 1280px) 420px, (min-width: 768px) 50vw, 100vw"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : null}
        {post.category ? (
          <Link
            href={`/blog?category=${encodeURIComponent(post.category.slug)}`}
            className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50/90"
            style={post.category.color ? { color: post.category.color } : undefined}
          >
            {post.category.name}
          </Link>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800/70">
          <time dateTime={post.publishedAt}>{publishedLabel}</time>
          <span aria-hidden className="text-emerald-200">
            •
          </span>
          <span>Slow ritual</span>
        </div>
        <h3 className="text-2xl font-semibold leading-snug tracking-tight text-emerald-950">
          <Link href={`/blog/${post.slug}`} className="transition hover:text-emerald-600">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className="text-base leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm font-semibold text-emerald-700">
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 transition hover:text-emerald-500">
            Read story
            <span aria-hidden className="text-lg leading-none transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <span aria-hidden className="text-xs uppercase tracking-[0.28em] text-emerald-300">Glow</span>
        </div>
      </div>
    </article>
  );
}
