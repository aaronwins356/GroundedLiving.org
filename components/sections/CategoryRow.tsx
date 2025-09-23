import Link from "next/link";
import type { CategorySummary } from "@/lib/contentful";

type Props = {
  categories: CategorySummary[];
};

export function CategoryRow({ categories }: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="section-shell pt-8">
      <div className="surface-card relative overflow-hidden">
        <div className="absolute -left-16 top-1/2 hidden h-48 w-48 -translate-y-1/2 rounded-full bg-rose-100/80 blur-3xl lg:block" aria-hidden />
        <div className="absolute -right-16 top-0 hidden h-32 w-32 rounded-full bg-sage-100/70 blur-3xl lg:block" aria-hidden />
        <div className="relative flex flex-col gap-6 px-6 py-10 lg:px-12">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-sage-500">Browse by intention</p>
              <h2 className="font-heading text-2xl text-[#3b443b]">Choose how you want to feel today</h2>
            </div>
            <p className="max-w-sm text-sm text-[#4c544c]">
              Explore curated collections of rituals, recipes, and reflections that match the season of your heart.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="tag-pill text-xs uppercase tracking-[0.2em]">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
