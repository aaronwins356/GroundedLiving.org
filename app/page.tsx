import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { FeaturedCarousel } from "../components/blog/FeaturedCarousel";
import { PostCard } from "../components/blog/PostCard";
import { PortableTextRenderer } from "../components/rich-text/PortableTextRenderer";
import { getPageBySlug, getPosts } from "../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../lib/sanity.image";
import styles from "./page.module.css";

export default async function HomePage() {
  const [posts, aboutPage] = await Promise.all([getPosts(), getPageBySlug("about")]);

  const heroSlides = posts.slice(0, 3).map((post) => ({
    ...post,
    imageUrl: hasSanityImageAsset(post.coverImage)
      ? urlForImage(post.coverImage).width(1200).height(800).fit("crop").auto("format").url()
      : null,
  }));
  const recentPosts = posts.slice(0, 6);
  const categories = Array.from(
    new Map(
      posts
        .filter((post) => post.category)
        .map((post) => [post.category!.slug, post.category!]),
    ).values(),
  );
  const aboutSnippet = aboutPage?.content?.slice(0, 2) ?? [];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden />
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>Welcome to Grounded Living</span>
            <h1 className={styles.heroTitle}>Mindful, natural, and holistic living for a calmer home.</h1>
            <p className={styles.heroIntro}>
              Pour a warm mug, breathe deep, and explore weekly reflections, nurturing recipes, and grounded rituals that keep life beautifully simple.
            </p>
            <div className={styles.heroActions}>
              <Link href="/blog" className={styles.primaryCta}>
                Explore the journal
              </Link>
              <Link href="/about" className={styles.secondaryCta}>
                Meet the guide
              </Link>
            </div>
            <div className={styles.heroPanel}>
              <span className={styles.heroPanelTitle}>Partner spotlight</span>
              <p>
                Reserve this space for soulful collaborators, affiliate offerings, or seasonal products—prominently displayed without overwhelming your stories.
              </p>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <span className={styles.heroPanelTitle}>Fresh rituals arrive weekly</span>
            <p>
              Publish new posts from Sanity Studio and they will appear instantly across the site, carousel, and email signups.
            </p>
            <p>
              Categories and featured imagery are pulled automatically, so staying consistent is as easy as a few gentle clicks.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>Browse by intention</span>
            <h2 className={styles.sectionTitle}>Categories to explore</h2>
          </div>
          <Link href="/blog" className={styles.sectionLink}>
            View all posts →
          </Link>
        </div>
        {categories.length ? (
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog?category=${encodeURIComponent(category.slug)}`}
                className={styles.categoryChip}
                style=
                  {category.color
                    ? ({ color: category.color, backgroundColor: `${category.color}22` } as CSSProperties)
                    : undefined}
              >
                {category.title}
              </Link>
            ))}
          </div>
        ) : (
          <p>
            Add categories to your Sanity posts to help readers discover topics quickly. Once saved, they will bloom here automatically.
          </p>
        )}
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>Featured</span>
            <h2 className={styles.sectionTitle}>Seasonal highlights</h2>
          </div>
        </div>
        <div className={styles.carouselShell}>
          <FeaturedCarousel posts={heroSlides} />
        </div>
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>Fresh on the journal</span>
            <h2 className={styles.sectionTitle}>Recent stories</h2>
          </div>
          <Link href="/blog" className={styles.sectionLink}>
            View archive →
          </Link>
        </div>
        {recentPosts.length ? (
          <div className={styles.cardsGrid}>
            {recentPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p>
            Publish your first post in Sanity to see it featured here. Each card pulls its title, excerpt, category badge, and cover image automatically.
          </p>
        )}
      </section>

      <section className={styles.freebieSection}>
        <div className={styles.freebieContent}>
          <span className={styles.sectionEyebrow}>Free wellness gift</span>
          <h2 className={styles.freebieTitle}>Get your printable wellness journal</h2>
          <p className={styles.freebieText}>
            Invite readers into your inner circle with a calming, guided journal. Use this space to capture leads for future offerings or affiliate partnerships.
          </p>
          <button type="button" className={styles.freebieCta}>
            Download the journal
          </button>
        </div>
        <div>
          <Image src="/freebie-journal.svg" alt="Wellness journal mockup" width={420} height={320} />
        </div>
      </section>

      <section className={styles.aboutSection}>
        <div className={styles.aboutCopy}>
          <span className={styles.sectionEyebrow}>About</span>
          <h2 className={styles.sectionTitle}>Hi, I&rsquo;m glad you&rsquo;re here.</h2>
          {aboutSnippet.length ? (
            <PortableTextRenderer value={aboutSnippet} />
          ) : (
            <p>
              Create an “About” page inside Sanity to introduce yourself and welcome new readers. A short bio will appear here automatically when it’s ready.
            </p>
          )}
          <Link href="/about" className={styles.sectionLink}>
            Read the full story →
          </Link>
        </div>
        <div className={styles.aboutImage}>
          {aboutPage?.coverImage && hasSanityImageAsset(aboutPage.coverImage) ? (
            <Image
              src={urlForImage(aboutPage.coverImage).width(1200).height(900).fit("crop").auto("format").url()}
              alt={aboutPage.coverImage.alt ?? "Grounded Living founder"}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
