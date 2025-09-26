import type { Metadata } from "next";

import { CategoryChips } from "@components/blog/CategoryChips";
import { HeroCarousel } from "@components/blog/HeroCarousel";
import { PostCard } from "@components/blog/PostCard";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { NewsletterSignup } from "@components/marketing/NewsletterSignup";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllBlogPosts, getCategories } from "@lib/contentful";
import { canonicalFor } from "@/lib/seo/meta";
import { breadcrumbList } from "@/lib/seo/schema";
import type { BlogPostSummary } from "@project-types/contentful";

export const revalidate = 300;

const CANONICAL_URL = canonicalFor("/blog").toString();

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Explore our latest rituals, remedies, and reflections for grounded living. Mindful wellness stories updated weekly.",
  alternates: {
    canonical: CANONICAL_URL,
  },
};

function splitFeatured(posts: BlogPostSummary[]): {
  featured: BlogPostSummary[];
  rest: BlogPostSummary[];
} {
  // Highlight the most recent three posts in the hero carousel.
  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);
  return { featured, rest };
}

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([getAllBlogPosts(), getCategories()]);
  const { featured, rest } = splitFeatured(posts);
  const breadcrumbItems = [
    { href: canonicalFor("/").toString(), label: "Home" },
    { href: CANONICAL_URL, label: "Journal" },
  ];
  const breadcrumbSchema = breadcrumbList(breadcrumbItems);

  return (
    <div className="stack-xl">
      <JsonLd item={breadcrumbSchema} id="blog-breadcrumb" />
      <Breadcrumbs items={breadcrumbItems} />
      <HeroCarousel posts={featured} />
      <CategoryChips categories={categories} />
      <section className="grid-posts">
        {rest.length ? (
          rest.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="about-preview">New stories are brewing—stay tuned as we expand this collection.</p>
        )}
      </section>
      <NewsletterSignup />
    </div>
  );
}
