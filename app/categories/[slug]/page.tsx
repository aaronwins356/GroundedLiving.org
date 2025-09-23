import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryChips } from "../../../components/blog/CategoryChips";
import { PostCard } from "../../../components/blog/PostCard";
import { NewsletterSignup } from "../../../components/marketing/NewsletterSignup";
import { getCategories, getPostsByCategory } from "../../../lib/contentful";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    return {};
  }

  return {
    title: `${category.name} stories`,
    description: category.description,
  } satisfies Metadata;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, posts] = await Promise.all([getCategories(), getPostsByCategory(slug)]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="stack-xl">
      <header className="category-hero">
        <span className="category-label">Category</span>
        <h1>{category.name}</h1>
        {category.description ? <p>{category.description}</p> : null}
      </header>
      <CategoryChips categories={categories} activeSlug={slug} />
      <section className="grid-posts">
        {posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="about-preview">No articles in this category yet—add one in Contentful to introduce the theme.</p>
        )}
      </section>
      <NewsletterSignup />
    </div>
  );
}
