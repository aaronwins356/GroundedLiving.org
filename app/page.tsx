import { getCategories, getFeaturedPosts, getLatestPosts, getPosts } from "@/lib/contentful";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CategoryRow } from "@/components/sections/CategoryRow";
import { LatestPostsGrid } from "@/components/sections/LatestPostsGrid";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const featured = getFeaturedPosts(posts, 3);
  const latest = getLatestPosts(posts, 0, 6);

  return (
    <>
      <section className="section-shell pt-6">
        <div className="grid gap-8 lg:grid-cols-[1fr]">
          <HeroCarousel posts={featured} />
        </div>
      </section>
      <CategoryRow categories={categories} />
      <LatestPostsGrid posts={latest} />
    </>
  );
}
