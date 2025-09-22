import type { Metadata } from "next";
import Image from "next/image";

import { PortableTextRenderer } from "../../components/rich-text/PortableTextRenderer";
import { getPageBySlug } from "../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../lib/sanity.image";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the heart behind Grounded Living and discover the story guiding each mindful post.",
};

export default async function AboutPage() {
  const page = await getPageBySlug("about");

  const coverImageUrl = page?.coverImage && hasSanityImageAsset(page.coverImage)
    ? urlForImage(page.coverImage).width(1800).height(900).fit("crop").auto("format").url()
    : null;

  return (
    <article className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>About Grounded Living</span>
          <h1 className={styles.heroTitle}>{page?.title ?? "A gentle welcome"}</h1>
          <p className={styles.heroIntro}>
            {page
              ? "This page is fully editable inside Sanity. Update the copy whenever your story or offerings evolve."
              : "Create an About page inside Sanity to introduce yourself. The copy you add there will appear automatically."}
          </p>
        </div>
        <div className={styles.heroImage}>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={page?.coverImage?.alt ?? page?.title ?? "Calming scene"}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : null}
        </div>
      </section>

      {page ? (
        <div className={styles.bodyCard}>
          <PortableTextRenderer value={page.content} />
        </div>
      ) : (
        <div className={styles.emptyCard}>
          Add your story, credentials, and mission inside the Sanity Studio (Content → Pages → About) to bring this space to life.
        </div>
      )}
    </article>
  );
}
