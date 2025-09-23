import type { Metadata } from "next";
import Link from "next/link";

import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { LatestPostsGrid } from "@/components/sections/LatestPostsGrid";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import { CategoryRow } from "@/components/sections/CategoryRow";
import { getBlogPosts, getCategories, paginatePosts, selectFeaturedPosts, CONTENTFUL_REVALIDATE_INTERVAL } from "@/lib/contentful";

const POSTS_PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Blog",
  description: "Seasonal rituals, gentle wellness guidance, and soulful business notes from Grounded Living.",
};

export const revalidate = CONTENTFUL_REVALIDATE_INTERVAL;

type PageProps = {
  searchParams?: {
    page?: string;
    category?: string;
  };
};

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const [posts, categories] = await Promise.all([getBlogPosts(), getCategories()]);

  const selectedCategory = searchParams?.category;
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category?.slug === selectedCategory)
    : posts;

  const heroPosts = selectFeaturedPosts(filteredPosts, 3);
  const heroIds = new Set(heroPosts.map((post) => post.id));
  const remainingPosts = filteredPosts.filter((post) => !heroIds.has(post.id));

  const currentPage = Math.max(Number.parseInt(searchParams?.page ?? "1", 10) || 1, 1);
  const { entries: paginated, totalPages } = paginatePosts(remainingPosts, currentPage, POSTS_PER_PAGE);

  return (
    <div className="space-y-12">
      <section className="section-shell pt-6">
        <HeroCarousel posts={heroPosts} />
      </section>

      <section className="section-shell">
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <CategoryChip href="/blog" label="All" isActive={!selectedCategory} />
            {categories.map((category) => (
              <CategoryChip
                key={category.slug}
                href={`/blog?category=${encodeURIComponent(category.slug)}`}
                label={category.name}
                isActive={selectedCategory === category.slug}
              />
            ))}
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-500 transition hover:text-sage-600"
          >
            Explore by category
          </Link>
        </div>
      </section>

      <LatestPostsGrid posts={paginated} />

      <Pagination basePath="/blog" currentPage={currentPage} totalPages={totalPages} category={selectedCategory} />

      <CategoryRow categories={categories} />

      <NewsletterSignup
        endpoint={process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT}
        providerLabel={process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "newsletter"}
      />
    </div>
  );
}

type CategoryChipProps = {
  href: string;
  label: string;
  isActive: boolean;
};

function CategoryChip({ href, label, isActive }: CategoryChipProps) {
  return (
    <Link
      href={href}
      className={`tag-pill text-xs uppercase tracking-[0.14em] ${isActive ? "bg-sage-500 text-white" : "text-sage-500"}`}
    >
      {label}
    </Link>
  );
}

type PaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  category?: string;
};

function Pagination({ basePath, currentPage, totalPages, category }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set("page", page.toString());
    }
    if (category) {
      params.set("category", category);
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="section-shell" aria-label="Blog pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {pages.map((page) => (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              page === currentPage
                ? "border-sage-400 bg-sage-500 text-white"
                : "border-cream-200 bg-white text-sage-500 hover:border-sage-300 hover:bg-sage-100/60"
            }`}
          >
            {page}
          </Link>
        ))}
      </div>
    </nav>
  );
}
