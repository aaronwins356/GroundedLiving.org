import styles from "./NewsletterSignup.module.css";

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  action?: string;
}

export function NewsletterSignup({
  title = "Nourish your inbox",
  description = "Seasonal rituals, mindful recipes, and wellness strategies. No noise—just grounding notes when it matters.",
  action = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION ?? "https://app.convertkit.com/forms/123456/subscriptions",
}: NewsletterSignupProps) {
  // The default action keeps previews functional; replace with your real provider when deploying.
  return (
    <section className={styles.signup}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <form className={styles.form} method="post" action={action} target="_blank" rel="noopener noreferrer">
          <label htmlFor="newsletter-email" className="visually-hidden">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
          <button type="submit">Join the circle</button>
        </form>
      </div>
    </section>
  );
}
