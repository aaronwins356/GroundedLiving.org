import type { Metadata } from "next";
import { CategoryChips } from "../../components/blog/CategoryChips";
import { HeroCarousel } from "../../components/blog/HeroCarousel";
import { PostCard } from "../../components/blog/PostCard";
import { NewsletterSignup } from "../../components/marketing/NewsletterSignup";
import { getBlogPosts, getCategories } from "../../lib/contentful";
import type { ContentfulBlogPost } from "../../types/contentful";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Explore our latest rituals, remedies, and reflections for grounded living. Mindful wellness stories updated weekly.",
};

function splitFeatured(posts: ContentfulBlogPost[]): {
  featured: ContentfulBlogPost[];
  rest: ContentfulBlogPost[];
} {
  // Highlight the most recent three posts in the hero carousel.
  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);
  return { featured, rest };
}

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([getBlogPosts(), getCategories()]);
  const { featured, rest } = splitFeatured(posts);

  return (
    <div className="stack-xl">
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
