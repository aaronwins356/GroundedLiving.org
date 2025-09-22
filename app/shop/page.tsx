import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "Future home of soulful wellness products, digital guides, and curated affiliate offerings.",
};

export default function ShopPage() {
  return (
    <section className={styles.page}>
      <span className={styles.eyebrow}>Shop</span>
      <h1 className={styles.title}>Coming soon</h1>
      <p className={styles.description}>
        We’re curating mindful tools, plant-powered recipes, and cozy rituals to support your grounded lifestyle. Check back
        soon or explore the latest stories in the meantime.
      </p>
      <Link href="/blog" className={styles.cta}>
        Visit the blog
      </Link>
    </section>
  );
}
