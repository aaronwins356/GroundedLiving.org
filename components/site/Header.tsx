"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SearchBox, useSearchController } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/site/SocialLinks";
import { Logo } from "@/components/site/Logo";
import { primaryNavigation } from "@/lib/navigation/primary";

const SEARCH_MODAL_RESULTS_ID = "header-search-results";
const SCROLL_DELTA = 16;

function useScrollState() {
  const [isScrolled, setScrolled] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [position, setPosition] = useState(0);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const current = window.scrollY;
      setScrolled(current > 12);
      setPosition(current);
      if (Math.abs(current - last) > SCROLL_DELTA) {
        setDirection(current > last ? "down" : "up");
        last = current;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isScrolled, isHidden: direction === "down" && position > 120 };
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const controller = useSearchController({ initialQuery: "", initialResults: null });
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const setMenuTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    menuTriggerRef.current = node;
  }, []);
  const { isScrolled, isHidden } = useScrollState();

  const setDialogRef = useCallback((node: HTMLDivElement | null) => {
    dialogRef.current = node;
  }, []);

  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
  }, []);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    controller.reset();
    triggerRef.current?.focus();
  }, [controller]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuTriggerRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      closeSearch();
      closeMenu();
      const searchParams = new URLSearchParams({ q: trimmed });
      router.push(`/search?${searchParams.toString()}`);
    },
    [closeMenu, closeSearch, router],
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const menuOrSearchOpen = isSearchOpen || isMenuOpen;
    document.body.classList.toggle("has-modal-open", menuOrSearchOpen);
    if (!menuOrSearchOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSearchOpen) {
          closeSearch();
        }
        if (isMenuOpen) {
          closeMenu();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, closeSearch, isMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return undefined;
    }

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusable?.[0];
    firstFocusable?.focus();

    return undefined;
  }, [isSearchOpen]);

  const emptyState = useMemo(
    () => (
      <div>
        <p>Search by ritual, ingredient, or intention to surface grounded living guides.</p>
        <p>Try phrases like <strong>circadian rhythm</strong>, <strong>blue light</strong>, or <strong>sleep routine</strong>.</p>
      </div>
    ),
    [],
  );

  const headerClasses = [
    "site-header",
    isScrolled ? "site-header--scrolled" : "",
    isHidden && !isMenuOpen && !isSearchOpen ? "site-header--hidden" : "",
    isMenuOpen ? "site-header--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClasses} role="banner">
      <Container className="site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="Grounded Living home">
          <Logo showTagline={false} />
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-nav__link${pathname === item.href ? " site-nav__link--active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <button
            type="button"
            className="search-trigger"
            onClick={openSearch}
            ref={setTriggerRef}
            aria-haspopup="dialog"
            aria-expanded={isSearchOpen}
          >
            <Search aria-hidden className="search-trigger__icon" />
            <span className="search-trigger__label">Search</span>
          </button>
          <button
            type="button"
            className="site-nav__menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={isMenuOpen}
            aria-controls="site-nav-overlay"
            ref={setMenuTriggerRef}
          >
            <Menu aria-hidden className="site-nav__menu-icon" />
            <span className="sr-only">Toggle navigation menu</span>
          </button>
        </div>
      </Container>

      <div
        id="site-nav-overlay"
        className={`site-nav__overlay${isMenuOpen ? " site-nav__overlay--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="site-nav__overlay-panel">
          <div className="site-nav__overlay-header">
            <Logo showTagline className="text-left" />
            <button type="button" className="site-nav__overlay-close" onClick={closeMenu} aria-label="Close menu">
              <X aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile primary" className="site-nav__overlay-links">
            {primaryNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="site-nav__overlay-link" onClick={closeMenu}>
                <span className="site-nav__overlay-link-label">{item.label}</span>
                {item.description ? <span className="site-nav__overlay-link-copy">{item.description}</span> : null}
              </Link>
            ))}
          </nav>
          <div className="site-nav__overlay-footer">
            <SocialLinks variant="stacked" />
            <p className="site-nav__overlay-note">
              Join the newsletter for weekly rituals and recipes delivered every Sunday.
            </p>
          </div>
        </div>
      </div>

      {isSearchOpen ? (
        <div className="search-modal">
          <div className="search-modal__overlay" aria-hidden onClick={closeSearch} />
          <div
            className="search-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="header-search-title"
            ref={setDialogRef}
          >
            <div className="search-modal__header">
              <h2 id="header-search-title">Search Grounded Living</h2>
              <button type="button" className="search-modal__close" onClick={closeSearch} aria-label="Close search">
                <X aria-hidden />
              </button>
            </div>
            <div className="search-modal__content">
              <SearchBox controller={controller} id="header-search" autoFocus onSubmit={handleSubmit} />
              <SearchResults controller={controller} listId={SEARCH_MODAL_RESULTS_ID} emptyState={emptyState} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
