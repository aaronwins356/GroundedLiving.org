import Image from "next/image";
import Link from "next/link";
import type { BlogPostSummary } from "@/lib/contentful";
import { getPlaceholderImage } from "@/lib/contentful";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  posts: BlogPostSummary[];
};

export function LatestPostsGrid({ posts }: Props) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="latest" className="section-shell">
      <div className="flex flex-col gap-3 pb-8">
        <p className="text-xs uppercase tracking-[0.45em] text-sage-500">Latest</p>
        <h2 className="font-heading text-3xl text-[#3b443b]">Fresh rituals & recipes</h2>
        <p className="max-w-2xl text-sm text-[#4c544c]">
          Discover the newest guides and musings from our journal, crafted to help you create soulful rhythms at home.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => {
          const image = post.coverImage ?? getPlaceholderImage();
          return (
            <article key={post.id} className="group surface-card overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.alt ?? post.title}
                  fill
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  placeholder={image.url.startsWith("data:") ? "blur" : undefined}
                  blurDataURL={image.url.startsWith("data:") ? image.url : undefined}
                />
              </div>
              <div className="flex flex-col gap-4 px-6 py-6">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-sage-500">
                  <span>{post.category?.name ?? "Journal"}</span>
                  <span className="h-px flex-1 bg-cream-200" />
                  <span>{formatDate(post.datePublished)}</span>
                </div>
                <h3 className="font-heading text-2xl text-[#3b443b]">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.excerpt ? <p className="text-sm text-[#4c544c]">{post.excerpt}</p> : null}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-sage-500 transition hover:text-sage-600"
                >
                  Continue reading
                  <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage-100/80 text-sage-500 shadow-inner transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
