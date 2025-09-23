import { paginatePosts, selectFeaturedPosts, formatDate, getSeoDescription } from "@/lib/contentful";

describe("contentful helpers", () => {
  const posts = Array.from({ length: 5 }).map((_, index) => ({
    id: `post-${index}`,
    slug: `post-${index}`,
    title: `Post ${index}`,
    excerpt: `Excerpt ${index}`,
    coverImage: null,
    category: null,
    author: null,
    tags: [],
    datePublished: new Date(2024, 0, index + 1).toISOString(),
    affiliate: false,
    seoDescription: `SEO ${index}`,
  }));

  it("paginates posts with bounds checking", () => {
    const { entries, totalPages } = paginatePosts(posts, 2, 2);
    expect(entries).toHaveLength(2);
    expect(entries[0].slug).toBe("post-2");
    expect(totalPages).toBe(3);
  });

  it("selects featured posts without exceeding length", () => {
    const featured = selectFeaturedPosts(posts, 3);
    expect(featured).toHaveLength(3);
    expect(featured[0].slug).toBe("post-0");
  });

  it("formats dates for display", () => {
    const formatted = formatDate("2024-03-15T00:00:00.000Z");
    expect(formatted).toContain("2024");
  });

  it("prefers seo description when available", () => {
    const description = getSeoDescription(posts[1]);
    expect(description).toBe("SEO 1");
  });
});
