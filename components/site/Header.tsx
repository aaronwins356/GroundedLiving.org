"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SearchBox, useSearchController } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import { Container } from "@/components/ui/Container";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Journal" },
  { href: "/shop", label: "Shop" },
];

const SEARCH_MODAL_RESULTS_ID = "header-search-results";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const controller = useSearchController({ initialQuery: "", initialResults: null });
  const [isSearchOpen, setSearchOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const setDialogRef = useCallback((node: HTMLDivElement | null) => {
    dialogRef.current = node;
  }, []);
  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    controller.reset();
    triggerRef.current?.focus();
  }, [controller]);

  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      closeSearch();
      const searchParams = new URLSearchParams({ q: trimmed });
      router.push(`/search?${searchParams.toString()}`);
    },
    [closeSearch, router],
  );

  useEffect(() => {
    if (!isSearchOpen) {
      document.body.classList.remove("has-modal-open");
      return undefined;
    }

    document.body.classList.add("has-modal-open");
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );

    const firstFocusable = focusable?.[0];
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }

      if (event.key === "Tab" && focusable && focusable.length > 0) {
        const focusArray = Array.from(focusable).filter((element) => !element.hasAttribute("disabled"));
        if (focusArray.length === 0) {
          return;
        }
        const first = focusArray[0];
        const last = focusArray[focusArray.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("has-modal-open");
    };
  }, [closeSearch, isSearchOpen]);

  const emptyState = useMemo(
    () => (
      <div>
        <p>Search by ritual, ingredient, or intention to surface grounded living guides.</p>
        <p>Try phrases like <strong>circadian rhythm</strong>, <strong>blue light</strong>, or <strong>sleep routine</strong>.</p>
      </div>
    ),
    [],
  );

  return (
    <header className="site-header" role="banner">
      <Container className="site-header__inner">
        <Link href="/" className="site-wordmark">
          Grounded Living
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {navigation.map((item) => (
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
        </div>
      </Container>
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
