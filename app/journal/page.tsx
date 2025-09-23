import type { Metadata } from "next";
import { getCategories, getPosts } from "@/lib/contentful";
import { LatestPostsGrid } from "@/components/sections/LatestPostsGrid";
import { CategoryRow } from "@/components/sections/CategoryRow";

export const metadata: Metadata = {
  title: "Journal",
  description: "All essays, recipes, and rituals from the Grounded Living journal in one calming archive.",
};

export default async function JournalPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div className="space-y-12">
      <section className="section-shell">
        <div className="surface-card flex flex-col gap-4 px-8 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-sage-500">The Journal</p>
          <h1 className="font-heading text-4xl text-[#3b443b]">Every story in one place</h1>
          <p className="mx-auto max-w-2xl text-sm text-[#4c544c]">
            Pour a cup of tea and wander through soulful essays, intuitive recipes, and grounding rituals gathered for you.
          </p>
        </div>
      </section>
      <LatestPostsGrid posts={posts} />
      <CategoryRow categories={categories} />
    </div>
  );
}
