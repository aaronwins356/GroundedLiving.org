import Link from "next/link";

import { getCategories, CONTENTFUL_REVALIDATE_INTERVAL } from "@/lib/contentful";

export const revalidate = CONTENTFUL_REVALIDATE_INTERVAL;

export default async function CategoriesIndexPage() {
  const categories = await getCategories();

  return (
    <div className="section-shell space-y-8">
      <header className="surface-card flex flex-col gap-3 px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-sage-500">Explore</p>
        <h1 className="font-heading text-4xl text-[#3b443b]">Browse by intention</h1>
        <p className="text-sm text-[#4c544c]">
          Choose the feeling you\'re cultivating to uncover rituals, recipes, and reflections to match.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="surface-card flex flex-col gap-3 px-6 py-6 transition hover:-translate-y-1 hover:shadow-glow"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-sage-500">{category.name}</span>
            {category.description ? <p className="text-sm text-[#4c544c]">{category.description}</p> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
