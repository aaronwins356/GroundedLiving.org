import Link from "next/link";
import type { BlogPostSummary } from "@/lib/contentful";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type Props = {
  posts: BlogPostSummary[];
  title?: string;
};

export function RelatedSidebar({ posts, title = "More to explore" }: Props) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <aside className="surface-card sticky top-32 flex flex-col gap-6 p-6">
      <h3 className="font-heading text-xl text-[#3b443b]">{title}</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-2xl border border-transparent p-3 transition hover:border-sage-200 hover:bg-sage-100/40">
            <p className="text-xs uppercase tracking-[0.35em] text-sage-500">{formatDate(post.datePublished)}</p>
            <p className="mt-2 font-heading text-lg text-[#3b443b]">{post.title}</p>
            {post.excerpt ? <p className="text-xs text-[#4c544c]">{post.excerpt}</p> : null}
          </Link>
        ))}
      </div>
      <div className="rounded-3xl border border-sage-200 bg-sage-100/60 p-4 text-center">
        <p className="font-heading text-sm text-sage-600">Affiliate Spotlight</p>
        <p className="mt-2 text-xs text-[#4c544c]">
          Share your favorite wellness tools here. Add or edit banners in Contentful to keep partnerships fresh.
        </p>
      </div>
    </aside>
  );
}
