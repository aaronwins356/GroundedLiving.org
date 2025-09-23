import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LatestPostsGrid } from "@/components/sections/LatestPostsGrid";
import { CategoryRow } from "@/components/sections/CategoryRow";
import { buildAbsoluteUrl, getCategories, getPostsByCategory } from "@/lib/contentful";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    return { title: "Category not found" };
  }

  const title = `${category.name} Intentions`;
  const description = `Stories and rituals curated for ${category.name.toLowerCase()} moments from Grounded Living.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: buildAbsoluteUrl(`/categories/${category.slug}`),
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(category.slug);

  return (
    <div className="space-y-12">
      <section className="section-shell">
        <div className="surface-card flex flex-col gap-6 px-8 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-sage-500">Intention</p>
          <h1 className="font-heading text-4xl text-[#3b443b]">{category.name}</h1>
          <p className="mx-auto max-w-2xl text-sm text-[#4c544c]">
            Discover grounded rituals, nourishing recipes, and soulful musings curated to help you cultivate {category.name.toLowerCase()}.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-sage-500">
            <Link href="/" className="transition hover:text-sage-600">
              Home
            </Link>
            <span className="h-px w-8 bg-cream-200" />
            <span>{category.name}</span>
          </div>
        </div>
      </section>
      <LatestPostsGrid posts={posts} />
      <CategoryRow categories={categories.filter((item) => item.slug !== category.slug)} />
    </div>
  );
}
