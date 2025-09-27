import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SocialLinks } from "@/components/site/SocialLinks";
import { getCategories } from "@/lib/contentful";

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclosure", label: "Disclosure" },
];

const DEFAULT_CONTACT_EMAIL = "hello@groundedliving.org";

export async function Footer() {
  const year = new Date().getFullYear();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? DEFAULT_CONTACT_EMAIL;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = (await getCategories()).slice(0, 6);
  } catch (error) {
    console.warn("Failed to load categories for footer navigation", error);
    categories = [];
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <Container>
        <div className="site-footer__grid">
          <div>
            <h2 className="site-footer__title">Stay grounded</h2>
            <NewsletterForm source="footer" />
          </div>
          <div>
            <h2 className="site-footer__title">Pages</h2>
            <nav aria-label="Primary pages">
              <ul className="site-footer__links">
                {pageLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div>
            <h2 className="site-footer__title">Categories</h2>
            <nav aria-label="Popular categories">
              <ul className="site-footer__links">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link href={`/blog/category/${category.slug}`}>{category.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div>
            <h2 className="site-footer__title">Contact</h2>
            <p className="site-footer__contact">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <br />We read every note.
            </p>
            <nav aria-label="Reach out">
              <ul className="site-footer__links">
                <li>
                  <Link href="/contact">Contact form</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/disclosure">Disclosure</Link>
                </li>
              </ul>
            </nav>
            <SocialLinks variant="stacked" className="site-footer__social" />
          </div>
        </div>
        <p className="site-footer__meta">&copy; {year} Grounded Living. All rights reserved.</p>
      </Container>
    </footer>
  );
}
