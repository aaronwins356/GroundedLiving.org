"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./Navbar.module.css";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const categoryLinks = [
  { href: "/blog?category=lifestyle", label: "Lifestyle" },
  { href: "/blog?category=movement", label: "Movement" },
  { href: "/blog?category=nutrition", label: "Nutrition" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Grounded Living
          </Link>
          <span className={styles.tagline}>Mindful wellness &amp; slow living</span>
        </div>
        <div className={styles.actions}>
          <nav aria-label="Primary navigation">
            <ul className={styles.primaryNav}>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.primaryLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/blog?category=newsletter" className={styles.newsletterLink}>
            Join the Newsletter
          </Link>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {isOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div className={styles.categoriesRow}>
          {categoryLinks.map((item) => (
            <Link key={item.label} href={item.href} className={styles.categoryLink}>
              {item.label}
            </Link>
          ))}
        </div>
        {isOpen ? (
          <div className={styles.drawer}>
            <nav aria-label="Mobile navigation">
              <ul className={styles.drawerList}>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.drawerLink} onClick={() => setIsOpen(false)}>
                      {item.label}
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/blog?category=newsletter"
                    className={styles.drawerLink}
                    onClick={() => setIsOpen(false)}
                  >
                    Join the Newsletter
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              </ul>
            </nav>
            <div className={styles.drawerCategories}>
              {categoryLinks.map((item) => (
                <Link key={item.label} href={item.href} className={styles.categoryLink} onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
