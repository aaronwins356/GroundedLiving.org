import Link from "next/link";

import styles from "./Footer.module.css";

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

const socialLinks = [
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "https://pinterest.com",
    label: "Pinterest",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.2 3C7.6 3 4 6.4 4 10.7c0 3 1.9 5.5 4.6 6.4-.1-.5-.1-1.3.1-1.9l1.2-4.6s-.3-.6-.3-1.4c0-1.3.8-2.3 1.8-2.3.8 0 1.2.6 1.2 1.4 0 .9-.6 2.3-.9 3.5-.3 1 .6 1.8 1.6 1.8 1.9 0 3.1-2.4 3.1-5.1 0-2.1-1.4-3.7-4-3.7-2.9 0-4.6 2.1-4.6 4.5 0 .8.3 1.7.8 2.2.1.1.1.1.1-.1l.3-1.1c.1-.3.1-.5-.1-.8-.3-.4-.4-.9-.4-1.5 0-1.8 1.3-3.3 3.6-3.3 1.9 0 3.2 1.3 3.2 3.1 0 2-.7 3.7-1.8 3.7-.6 0-1-.5-.8-1.1.2-.8.6-1.8.9-2.8.2-.7-.1-1.3-.8-1.3-.7 0-1.3.7-1.3 1.5 0 .5.2.9.2 1.1l-.8 3.3c-.2.8-.1 1.9-.1 2.6 0 .2.2.3.3.2 1.6-.8 2.6-2.8 2.6-4.9 0-2.6-2-4.8-5.1-4.8z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 8.2c-.2-1.2-.9-2.1-2-2.3C18 5.5 12 5.5 12 5.5s-6 0-7.6.4c-1.1.3-1.8 1.1-2 2.3C2 9.4 2 12 2 12s0 2.6.4 3.8c.2 1.2.9 2.1 2 2.3 1.6.4 7.6.4 7.6.4s6 0 7.6-.4c1.1-.3 1.8-1.1 2-2.3.4-1.2.4-3.8.4-3.8s0-2.6-.4-3.8zM10 14.7V9.3l4.9 2.7L10 14.7z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Grounded Living</span>
          <p className={styles.brandCopy}>
            A soft sanctuary for mindful rituals, nourishing recipes, and slow living inspiration.
          </p>
        </div>
        <div className={styles.quickLinks}>
          <span className={styles.quickLinksTitle}>Quick Links</span>
          <ul className={styles.quickLinksList}>
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.quickLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.newsletter}>
          <span className={styles.newsletterTitle}>Receive seasonal notes &amp; soulful journal prompts.</span>
          <form className={styles.newsletterForm}>
            <label htmlFor="footer-email" className="visually-hidden">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              className={styles.newsletterInput}
              autoComplete="email"
            />
            <button type="button" className={styles.submitButton}>
              Subscribe
            </button>
          </form>
        </div>
        <div className={styles.bottomRow}>
          <span>© {new Date().getFullYear()} Grounded Living</span>
          <ul className={styles.socialList}>
            {socialLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={styles.socialLink} aria-label={item.label}>
                  {item.icon}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
