import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Journal" },
  { href: "/shop", label: "Shop" },
];

const trustLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclosure", label: "Disclosure" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <Container>
        <div className="site-footer__grid">
          <div>
            <h2 className="site-footer__title">Stay grounded</h2>
            <NewsletterForm />
          </div>
          <div>
            <h2 className="site-footer__title">Explore</h2>
            <nav aria-label="Site links">
              <ul className="site-footer__links">
                {siteLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div>
            <h2 className="site-footer__title">Trust</h2>
            <nav aria-label="Trust and legal">
              <ul className="site-footer__links">
                {trustLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <p className="site-footer__meta">&copy; {year} Grounded Living. All rights reserved.</p>
      </Container>
    </footer>
  );
}
