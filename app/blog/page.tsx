import type { Metadata, PageProps } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPosts } from "../../lib/sanity.queries";
import { urlForImage } from "../../lib/sanity.image";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore mindful health, nutrition, and lifestyle articles from Grounded Living.",
};

const POSTS_PER_PAGE = 6;

interface BlogIndexPageProps extends PageProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
  };
}

function buildQueryString(params: Record<string, string | undefined>) {
  const filteredEntries = Object.entries(params).filter((entry): entry is [string, string] => {
    const value = entry[1];
    return typeof value === "string";
  });
  const nonEmptyEntries = filteredEntries.filter(([, value]) => value.length > 0);
  return nonEmptyEntries.length ? `?${new URLSearchParams(nonEmptyEntries).toString()}` : "";
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const posts = await getPosts();
  const formatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const search = searchParams.search?.toLowerCase() ?? "";
  const selectedCategory = searchParams.category ?? "";

  const categories = Array.from(
    new Set(posts.map((post) => post.category).filter((category): category is string => Boolean(category))),
  ).sort();

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const haystack = `${post.title} ${post.excerpt ?? ""}`.toLowerCase();
    const matchesSearch = search ? haystack.includes(search) : true;
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1),
  );
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const baseQuery = {
    search: search || undefined,
    category: selectedCategory || undefined,
  };

  return (
    <div className="space-y-16">
      <section className="rounded-3xl bg-gradient-to-r from-primary/10 via-slate-50 to-primary/10 px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Insights & Rituals</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Blog</h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Slow living guidance, nourishing recipes, and mindful practices to help you feel rooted in every season.
            </p>
          </div>
          <form className="mx-auto flex w-full max-w-xl gap-3" method="get">
            {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
            <label htmlFor="search" className="sr-only">
              Search posts
            </label>
            <input
              id="search"
              name="search"
              defaultValue={searchParams.search ?? ""}
              placeholder="Search articles..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-10">
        {categories.length ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Explore by Category</h2>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <Link
                  href={`/blog${buildQueryString({ ...baseQuery, category: undefined, page: undefined })}`}
                  className={`rounded-full border px-4 py-2 transition ${
                    selectedCategory
                      ? "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                      : "border-transparent bg-primary text-white shadow hover:bg-primary-dark"
                  }`}
                >
                  All
                </Link>
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <Link
                      key={category}
                      href={`/blog${buildQueryString({ ...baseQuery, category, page: undefined })}`}
                      className={`rounded-full border px-4 py-2 transition ${
                        isActive
                          ? "border-transparent bg-primary text-white shadow hover:bg-primary-dark"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {category}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedPosts.length ? (
            paginatedPosts.map((post) => {
              const coverImageUrl = post.coverImage
                ? urlForImage(post.coverImage).width(800).height(560).fit("crop").auto("format").url()
                : null;

              return (
                <article
                  key={post.slug}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {coverImageUrl ? (
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={coverImageUrl}
                        alt={post.coverImage?.alt ?? post.title}
                        fill
                        sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="h-56 w-full bg-gradient-to-br from-slate-100 via-white to-slate-200" />
                  )}
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <span>{post.category}</span>
                      <time dateTime={post.publishedAt}>{formatter.format(new Date(post.publishedAt))}</time>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        <Link href={`/blog/${post.slug}`} className="transition hover:text-primary-dark">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                    </div>
                    <div className="mt-auto">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
                      >
                        Read More
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              No posts match your filters right now. Try adjusting your search or category.
            </p>
          )}
        </div>

        {totalPages > 1 ? (
          <nav className="flex items-center justify-center gap-2">
            <Link
              aria-disabled={currentPage === 1}
              href={`/blog${
                currentPage === 1
                  ? buildQueryString({ ...baseQuery, page: undefined })
                  : buildQueryString({ ...baseQuery, page: String(currentPage - 1) })
              }`}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentPage === 1
                  ? "cursor-not-allowed border border-slate-200 text-slate-300"
                  : "border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
              }`}
            >
              Previous
            </Link>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
              const isActive = pageNumber === currentPage;
              return (
                <Link
                  key={pageNumber}
                  href={`/blog${buildQueryString({ ...baseQuery, page: String(pageNumber) })}`}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-white shadow"
                      : "border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNumber}
                </Link>
              );
            })}
            <Link
              aria-disabled={currentPage === totalPages}
              href={`/blog${
                currentPage === totalPages
                  ? buildQueryString({ ...baseQuery, page: undefined })
                  : buildQueryString({ ...baseQuery, page: String(currentPage + 1) })
              }`}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed border border-slate-200 text-slate-300"
                  : "border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
              }`}
            >
              Next
            </Link>
          </nav>
        ) : null}
      </section>

      <section className="rounded-3xl bg-slate-900 px-8 py-12 text-white sm:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-light">Stay Grounded</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Join the Ritual Letters</h2>
            <p className="text-base text-slate-200 sm:text-lg">
              Receive gentle reminders, seasonal checklists, and nourishing recipes straight to your inbox each month.
            </p>
          </div>
          <form className="flex w-full flex-col gap-3 sm:flex-row">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full flex-1 rounded-full border-0 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
            <button
              type="button"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:bg-primary-dark"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-slate-300">No spam—just thoughtful guidance to support your most grounded self.</p>
        </div>
      </section>
    </div>
  );
}
