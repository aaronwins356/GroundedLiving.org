import Link from "next/link";

import { Container } from "@/components/ui/Container";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Journal" },
  { href: "/shop", label: "Shop" },
];

export function Header() {
  return (
    <header className="site-header" role="banner">
      <Container className="site-header__inner">
        <Link href="/" className="site-wordmark">
          Grounded Living
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="site-nav__toggle">
          <summary aria-label="Toggle navigation">
            <span aria-hidden>Menu</span>
            <span className="sr-only">Toggle navigation</span>
          </summary>
          <div className="site-nav__panel" role="menu">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="site-nav__link" role="menuitem">
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </Container>
    </header>
  );
}
