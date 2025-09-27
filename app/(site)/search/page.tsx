import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { getCategories } from "@/lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";
import { breadcrumbList, websiteSchema } from "@/lib/seo/schema";
import {
  buildSearchIndex,
  getCachedIndex,
  searchIndexDocs,
  setCachedIndex,
} from "@/lib/search/index";
import { siteUrl } from "@/lib/site";

const CANONICAL_URL = canonicalFor("/search").toString();
const DEFAULT_LIMIT = 10;
const PAGE_TITLE = buildMetaTitle("Search");
const PAGE_DESCRIPTION = truncateAtBoundary(
  "Search rituals, recipes, and trusted guides from the Grounded Living journal.",
  155,
);

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

interface PopularCategory {
  name: string;
  slug: string;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : "";
  const pageParam = Number.parseInt(params?.page ?? "1", 10);

  let index = getCachedIndex();
  if (!index) {
    index = await buildSearchIndex();
    setCachedIndex(index);
  }

  const initialResults = query ? searchIndexDocs(index.docs, query, pageParam, DEFAULT_LIMIT) : null;

  const categories = await getCategories();
  const popularCategories = categories.slice(0, 6).map((category) => ({ name: category.name, slug: category.slug }));

  const breadcrumb = breadcrumbList([
    { href: canonicalFor("/").toString(), label: "Home" },
    { href: CANONICAL_URL, label: "Search" },
  ]);

  const websiteJsonLd = websiteSchema({
    name: "Grounded Living",
    url: siteUrl.toString(),
    searchUrl: `${CANONICAL_URL}?q=`,
  });

  return (
    <Container className="stack-xl">
      <JsonLd item={websiteJsonLd} id="website-schema" />
      <JsonLd item={breadcrumb} id="search-breadcrumbs" />
      <header className="stack-xl">
        <h1>Find grounding rituals faster</h1>
        <p>Search our growing library of circadian-friendly routines, breathwork, recipes, and mindful living guides.</p>
      </header>
      <SearchPageClient
        initialQuery={query}
        initialResults={initialResults}
        popularCategories={popularCategories}
        listId="site-search-results"
      />
    </Container>
  );
}
