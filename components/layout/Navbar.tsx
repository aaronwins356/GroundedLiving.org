"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ContentfulPage } from "../../types/contentful";

import styles from "./Navbar.module.css";

interface NavbarProps {
  pages: ContentfulPage[];
}

// We keep a minimal set of fallback links so navigation still renders while
// Contentful environments are being provisioned during onboarding.
const FALLBACK_LINKS = [
  { href: "/", label: "Home", priority: 0 },
  { href: "/blog", label: "Blog", priority: 1 },
];

function buildNavigation(pages: ContentfulPage[]) {
  const staticLinks = pages
    .filter((page) => page.slug !== "home")
    .map((page) => ({
      href: `/${page.slug}`,
      label: page.navigationLabel ?? page.title,
      priority: page.navigationPriority ?? 99,
    }));

  return [...FALLBACK_LINKS, ...staticLinks].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function Navbar({ pages }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navigation = buildNavigation(pages);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.branding}>
          <Link href="/" className={styles.logo}>
            Grounded Living
          </Link>
          <span className={styles.tagline}>Soulful wellness &amp; slow living</span>
        </div>
        <nav className={styles.primaryNav} aria-label="Primary navigation">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.primaryLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.shopLink}>
            Digital shop
          </Link>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      {isOpen ? (
        <div className={styles.drawer}>
          <nav aria-label="Mobile navigation">
            <ul>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.drawerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className={styles.drawerLink}>
                  Digital shop
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
