import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out to Grounded Living with collaboration ideas, media inquiries, or heartfelt notes.",
};

export default function ContactPage() {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>Say hello</span>
        <h1 className={styles.title}>We&rsquo;d love to hear from you</h1>
        <p className={styles.copy}>
          Whether you&rsquo;re dreaming up a collaboration, have a question about a ritual, or simply want to share how you&rsquo;re
          living more gently, send a note anytime.
        </p>
        <p className={styles.copy}>
          We typically respond within two business days with thoughtful, personalized replies.
        </p>
      </div>
      <div className={styles.contactCard}>
        <span className={styles.eyebrow}>Get in touch</span>
        <Link href="mailto:hello@groundedliving.org" className={styles.link}>
          hello@groundedliving.org
        </Link>
        <Link href="https://instagram.com" className={styles.link}>
          Instagram direct message
        </Link>
        <Link href="/blog?category=newsletter" className={styles.link}>
          Join the newsletter →
        </Link>
      </div>
    </section>
  );
}
