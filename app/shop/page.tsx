import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "Future home of soulful wellness products, digital guides, and curated affiliate offerings.",
};

export default function ShopPage() {
  const checkoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL ?? "https://buy.stripe.com/test_checkout_placeholder";

  return (
    <section className={styles.page}>
      <span className={styles.eyebrow}>Shop</span>
      <h1 className={styles.title}>Grounded Living digital library</h1>
      <p className={styles.description}>
        Reserve your spot for our upcoming digital bundle featuring restorative rituals, nourishing recipes, and printable
        trackers. The checkout link below routes to a placeholder Stripe session so you can wire up the real SKU whenever
        you&rsquo;re ready.
      </p>
      <a href={checkoutUrl} className={styles.cta} target="_blank" rel="noopener noreferrer">
        Preview checkout
      </a>
    </section>
  );
}
