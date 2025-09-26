import { NewsletterForm } from "@/components/ui/NewsletterForm";

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
        <NewsletterForm
          variant="inline"
          className={styles.form}
          hideLabel
          submitLabel="Join the circle"
          source="marketing-inline"
        />
      </div>
    </section>
  );
}
