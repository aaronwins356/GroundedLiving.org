import { ProgressiveNewsletterForm } from "@/components/marketing/ProgressiveNewsletterForm";

import styles from "./NewsletterSignup.module.css";

interface NewsletterSignupProps {
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  title = "Nourish your inbox",
  description = "Seasonal rituals, mindful recipes, and wellness strategies. No noise—just grounding notes when it matters.",
}: NewsletterSignupProps) {
  return (
    <section className={styles.signup}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <ProgressiveNewsletterForm
          // Defer hydrating the interactive form until the block is scrolled
          // near the viewport so the homepage ships less JavaScript up front.
          variant="inline"
          className={styles.form}
          hideLabel
          submitLabel="Join the circle"
          source="marketing-inline"
          fallback={
            <div className={styles.formSkeleton} aria-hidden>
              <div className={styles.formPlaceholder} />
              <div className={styles.buttonPlaceholder} />
            </div>
          }
        />
        <noscript>
          <p className={styles.noscriptMessage}>Enable JavaScript to join the newsletter.</p>
        </noscript>
      </div>
    </section>
  );
}
