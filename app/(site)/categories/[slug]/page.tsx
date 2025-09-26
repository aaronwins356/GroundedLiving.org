import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryChips } from "@components/blog/CategoryChips";
import { PostCard } from "@components/blog/PostCard";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { NewsletterSignup } from "@components/marketing/NewsletterSignup";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getPostsByCategory } from "@lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";
import { breadcrumbList } from "@/lib/seo/schema";
import type { ContentfulCategory } from "@project-types/contentful";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category: ContentfulCategory) => ({ slug: category.slug }));
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
    alternates: {
      canonical: canonicalFor(`/categories/${slug}`).toString(),
    },
  } satisfies Metadata;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, posts] = await Promise.all([getCategories(), getPostsByCategory(slug)]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const canonicalUrl = canonicalFor(`/categories/${slug}`).toString();
  const breadcrumbItems = [
    { href: canonicalFor("/").toString(), label: "Home" },
    { href: canonicalFor("/blog").toString(), label: "Journal" },
    { href: canonicalUrl, label: category.name },
  ];
  const breadcrumbSchema = breadcrumbList(breadcrumbItems);

  return (
    <div className="stack-xl">
      <JsonLd item={breadcrumbSchema} id={`category-${slug}-breadcrumb`} />
      <Breadcrumbs items={breadcrumbItems} />
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
