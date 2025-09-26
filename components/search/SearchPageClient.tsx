"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SearchBox, useSearchController } from "./SearchBox";
import { SearchResults } from "./SearchResults";
import type { SearchResultSet } from "@/lib/search/index";

interface PopularCategory {
  name: string;
  slug: string;
}

interface SearchPageClientProps {
  initialQuery: string;
  initialResults: SearchResultSet | null;
  popularCategories: PopularCategory[];
  listId: string;
}

function buildEmptyState(categories: PopularCategory[]) {
  if (!categories.length) {
    return (
      <div>
        <p>Try searching for circadian rhythm, blue light routines, or seasonal reset rituals.</p>
      </div>
    );
  }

  return (
    <div>
      <p>Try one of these foundational topics:</p>
      <ul>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/categories/${category.slug}`}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SearchPageClient({
  initialQuery,
  initialResults,
  popularCategories,
  listId,
}: SearchPageClientProps) {
  const controller = useSearchController({ initialQuery, initialResults });
  const emptyState = useMemo(() => buildEmptyState(popularCategories), [popularCategories]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const trimmed = controller.query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
      if (controller.page > 1) {
        params.set("page", controller.page.toString());
      }
    }
    const search = params.toString();
    const basePath = pathname ?? "/search";
    const target = search ? `${basePath}?${search}` : basePath;
    router.replace(target, { scroll: false });
  }, [controller.page, controller.query, pathname, router]);

  return (
    <div className="stack-xl">
      <SearchBox controller={controller} id="site-search" />
      <SearchResults controller={controller} listId={listId} emptyState={emptyState} />
    </div>
  );
}
