import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SocialLinks } from "@/components/site/SocialLinks";
import { Logo } from "@/components/site/Logo";
import { footerNavigation, primaryNavigation } from "@/lib/navigation/primary";
import { getCategories } from "@/lib/contentful";

const DEFAULT_CONTACT_EMAIL = "hello@groundedliving.org";

export async function Footer() {
  const year = new Date().getFullYear();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? DEFAULT_CONTACT_EMAIL;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = (await getCategories()).slice(0, 4);
  } catch (error) {
    console.warn("Failed to load categories for footer navigation", error);
    categories = [];
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <Container className="site-footer__container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Logo variant="stacked" showTagline />
            <p className="site-footer__copy">
              A calm, credible resource for holistic rituals, seasonal nourishment, and mindful tools that help you live well at
              home.
            </p>
            <address className="site-footer__contact" aria-label="Contact">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </address>
            <SocialLinks variant="compact" className="site-footer__social" />
          </div>
          <div className="site-footer__links-column">
            <h2 className="site-footer__title">Explore</h2>
            <nav aria-label="Primary sections" className="site-footer__nav">
              <ul>
                {primaryNavigation.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            {categories.length ? (
              <nav aria-label="Featured categories" className="site-footer__nav">
                <h3 className="site-footer__subtitle">Top categories</h3>
                <ul>
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link href={`/categories/${category.slug}`}>{category.name}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
          <div className="site-footer__cta">
            <h2 className="site-footer__title">Stay in the circle</h2>
            <p className="site-footer__copy">
              Join 12k+ readers receiving one nourishing email each Sunday. No noise—just rituals, recipes, and researched tips.
            </p>
            <NewsletterForm
              source="footer"
              submitLabel="Join the journal"
              hint="We honour your inbox. Unsubscribe anytime."
              className="site-footer__form"
              inputClassName="site-footer__input"
              buttonClassName="site-footer__button"
            />
          </div>
        </div>
        <div className="site-footer__meta">
          <p>&copy; {year} Grounded Living. All rights reserved.</p>
          <nav aria-label="Legal">
            <ul>
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
