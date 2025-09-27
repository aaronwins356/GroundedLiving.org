import Link from "next/link";

import { CategoryChips } from "@components/blog/CategoryChips";
import { HeroCarousel } from "@components/blog/HeroCarousel";
import { PostCard } from "@components/blog/PostCard";
import { NewsletterSignup } from "@components/marketing/NewsletterSignup";
import { buttonClassNames } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getAllBlogPosts, getCategories, getPages } from "@lib/contentful";
import type { BlogPostSummary, ContentfulPage, RichTextNode } from "@project-types/contentful";

export const revalidate = 300;

export default async function HomePage() {
  const [posts, categories, pages] = await Promise.all([getAllBlogPosts(), getCategories(), getPages()]);
  const featured = posts.slice(0, 3);
  const latest = posts.slice(0, 6);
  const aboutPage = pages.find((page: ContentfulPage) => page.slug === "about");

  return (
    <div className="stack-xl">
      <Reveal as="section" className="home-hero" delay={60}>
        <div className="home-hero-copy">
          <span className="hero-eyebrow">Grounded rituals for intentional living</span>
          <h1>Your sanctuary for soulful wellness</h1>
          <p>
            Slow down, breathe deeply, and explore holistic remedies, restorative routines, and community-backed recommendations
            curated to help you feel rooted every day.
          </p>
          <div className="hero-actions">
            <Link href="/blog" className={buttonClassNames({ size: "lg" })}>
              Explore the journal
            </Link>
            <Link href="/shop" className={buttonClassNames({ variant: "secondary", size: "lg" })}>
              Visit the shop
            </Link>
          </div>
        </div>
        <HeroCarousel posts={featured} />
      </Reveal>

      <Reveal as="section" className="home-section" delay={120}>
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Discover</span>
            <h2>Browse by intention</h2>
          </div>
          <Link href="/blog" className="section-link">
            Find your focus →
          </Link>
        </div>
        <CategoryChips categories={categories} />
      </Reveal>

      <Reveal as="section" className="home-section" delay={160}>
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Fresh from the journal</span>
            <h2>Latest posts</h2>
          </div>
          <Link href="/blog" className="section-link">
            View all stories →
          </Link>
        </div>
        <div className="grid-posts">
          {latest.map((post: BlogPostSummary) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </Reveal>

      <Reveal as="div" className="home-newsletter" delay={200}>
        <NewsletterSignup />
      </Reveal>

      {aboutPage ? (
        <Reveal as="section" className="home-section about-highlight" delay={220}>
          <div className="section-header">
            <div>
              <span className="section-eyebrow">About</span>
              <h2>Meet the guide</h2>
            </div>
            <Link href="/about" className="section-link">
              Read the story →
            </Link>
          </div>
          <div className="about-panel">
            <RichTextPreview content={aboutPage.content?.content ?? []} />
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

interface RichTextPreviewProps {
  content: RichTextNode[];
}

function RichTextPreview({ content }: RichTextPreviewProps) {
  const paragraph = content.find((node) => node.nodeType === "paragraph");
  const text =
    paragraph?.content
      ?.map((child: RichTextNode) => (typeof child.value === "string" ? child.value : ""))
      .filter(Boolean)
      .join(" ") ??
    // Provide an inviting default so the hero still feels intentional before the
    // About page is published inside Contentful.
    "Grounded Living is where mindful rituals, nourishing recipes, and nature-rooted wisdom come together.";

  return <p className="about-preview">{text}</p>;
}
