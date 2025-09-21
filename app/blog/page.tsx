import parse, { Element as ParsedElement } from "html-react-parser";
import type { DOMNode, Element } from "html-react-parser";
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
    page?: string;
  };
}

function renderExcerpt(excerpt?: string) {
  if (!excerpt) {
    return null;
  }

  return parse(excerpt, {
    replace: (node: DOMNode) => {
      if (node instanceof ParsedElement && node.attribs) {
        const element = node as Element & {
          attribs: Record<string, string | undefined>;
        };
        const { href, target: _target, rel: _rel, ...rest } = element.attribs;
        // Normalize anchor attributes so server rendering stays deterministic across environments.
        return (
          <a {...rest} href={href}>
            {href}
          </a>
        );
      }
    },
  });
}

function buildQueryString(params: Record<string, string | undefined>) {
  const filteredEntries = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  );
  const nonEmptyEntries = filteredEntries.filter(([, value]) => value.length > 0);
  return nonEmptyEntries.length ? `?${new URLSearchParams(nonEmptyEntries).toString()}` : "";
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const posts = await getPosts();
  const formatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const search = searchParams.search?.toLowerCase() ?? "";

  const filteredPosts = posts.filter((post) => {
    const haystack = `${post.title} ${post.excerpt ?? ""}`.toLowerCase();
    return search ? haystack.includes(search) : true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1),
  );
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const baseQuery = {
    search: search || undefined,
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
                        alt={post.title}
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
                      <span>Published</span>
                      <time dateTime={post.publishedAt}>{formatter.format(new Date(post.publishedAt))}</time>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        <Link href={`/blog/${post.slug}`} className="transition hover:text-primary-dark">
                          {post.title}
                        </Link>
                      </h2>
                      {post.excerpt ? (
                        <p className="text-sm leading-relaxed text-slate-600">{renderExcerpt(post.excerpt)}</p>
                      ) : null}
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
              No posts match your search right now. Try a different keyword.
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
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-white text-primary shadow hover:text-primary-dark"
              }`}
            >
              Previous
            </Link>
            <span className="text-sm font-semibold text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              aria-disabled={currentPage === totalPages}
              href={`/blog${
                currentPage === totalPages
                  ? buildQueryString({ ...baseQuery, page: undefined })
                  : buildQueryString({ ...baseQuery, page: String(currentPage + 1) })
              }`}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-white text-primary shadow hover:text-primary-dark"
              }`}
            >
              Next
            </Link>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
