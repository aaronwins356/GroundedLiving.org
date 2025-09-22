import Image from "next/image";
import Link from "next/link";

import type { PostListItem } from "../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../lib/sanity.image";

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

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-brand-100 bg-white/90 shadow-soft-lg transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-56 w-full overflow-hidden bg-brand-50/60">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={post.coverImage?.alt ?? post.title}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-7">
        <div className="flex items-center justify-between text-xs font-medium text-accent-soft">
          {post.category ? (
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="rounded-full bg-brand-100/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brand-700 transition hover:bg-brand-200"
            >
              {post.category}
            </Link>
          ) : (
            <span className="rounded-full bg-brand-100/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brand-700">
              Mindful Living
            </span>
          )}
          <time dateTime={post.publishedAt} className="uppercase tracking-[0.3em] text-brand-600/80">
            {formattedDate}
          </time>
        </div>
        <div className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-accent">
            <Link href={`/blog/${post.slug}`} className="transition hover:text-brand-700">
              {post.title}
            </Link>
          </h2>
          {post.excerpt ? <p className="text-sm leading-relaxed text-accent-soft">{post.excerpt}</p> : null}
        </div>
        <div className="mt-auto">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            Read story
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
