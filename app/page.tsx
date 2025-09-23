import { getCategories, getBlogPosts, selectFeaturedPosts } from "@/lib/contentful";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CategoryRow } from "@/components/sections/CategoryRow";
import { LatestPostsGrid } from "@/components/sections/LatestPostsGrid";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([getBlogPosts(), getCategories()]);
  const featured = selectFeaturedPosts(posts, 3);
  const latest = posts.slice(0, 6);

  return (
    <>
      <section className="section-shell pt-6">
        <div className="grid gap-8 lg:grid-cols-[1fr]">
          <HeroCarousel posts={featured} />
        </div>
      </section>
      <CategoryRow categories={categories} />
      <LatestPostsGrid posts={latest} />
      <NewsletterSignup
        endpoint={process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT}
        providerLabel={process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "newsletter"}
      />
    </>
  );
}
