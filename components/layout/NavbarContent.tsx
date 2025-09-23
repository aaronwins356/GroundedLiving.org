"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { CategorySummary, PageSummary } from "@/lib/contentful";
import { BrandMark } from "./Navbar";

type Props = {
  categories: CategorySummary[];
  pages: PageSummary[];
};

export function NavContent({ categories, pages }: Props) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  const staticLinks: PageSummary[] = [
    { title: "Home", slug: "", href: "/" },
    { title: "Blog", slug: "blog", href: "/blog" },
  ];

  const marketingLinks = pages.map((page) => ({ ...page, href: `/pages/${page.slug}` }));

  const preferredOrder = ["about", "contact"];
  const orderedMarketing = [...marketingLinks].sort((a, b) => {
    const indexA = preferredOrder.indexOf(a.slug.toLowerCase());
    const indexB = preferredOrder.indexOf(b.slug.toLowerCase());
    if (indexA === -1 && indexB === -1) return a.title.localeCompare(b.title);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const baseLinks = [...staticLinks, ...orderedMarketing];

  const toggleMenu = () => setIsMenuOpen((value) => !value);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto mt-4 w-[min(92%,1100px)] rounded-full border border-cream-200 bg-white/80 px-5 py-3 shadow-[0_15px_45px_rgba(108,159,136,0.18)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <div className="hidden items-center gap-1 lg:flex">
            {baseLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sage-100/70 text-sage-600 shadow-inner"
                      : "text-[#3b443b] hover:bg-cream-100 hover:text-sage-600",
                  )}
                >
                  {link.title}
                </Link>
              );
            })}
            {categories.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDrawer((value) => !value)}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#3b443b] transition-all duration-200",
                    showCategoryDrawer
                      ? "bg-sage-100/70 text-sage-600 shadow-inner"
                      : "hover:bg-cream-100 hover:text-sage-600",
                  )}
                >
                  Browse by intention
                  <ChevronDown className={clsx("h-4 w-4 transition-transform", showCategoryDrawer && "rotate-180")} />
                </button>
                {showCategoryDrawer ? (
                  <div className="absolute right-0 top-full mt-3 w-80 rounded-3xl border border-cream-200 bg-white/90 p-4 shadow-[0_25px_60px_rgba(169,146,128,0.28)] backdrop-blur">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          className="tag-pill text-xs uppercase tracking-[0.12em]"
                          onClick={() => setShowCategoryDrawer(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-4 lg:hidden">
            {categories.length > 0 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-sage-200 bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sage-500 shadow-sm"
                onClick={() => setShowCategoryDrawer((value) => !value)}
              >
                Intentions
                <ChevronDown className={clsx("h-4 w-4 transition-transform", showCategoryDrawer && "rotate-180")} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-white text-[#3b443b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {showCategoryDrawer && categories.length > 0 ? (
          <div className="mt-4 lg:hidden">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="tag-pill text-xs uppercase tracking-[0.12em]"
                  onClick={() => {
                    setShowCategoryDrawer(false);
                    closeMenu();
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {isMenuOpen ? (
          <div className="mt-4 space-y-2 rounded-3xl border border-cream-200 bg-white/80 p-4 shadow-[0_18px_50px_rgba(108,159,136,0.16)] lg:hidden">
            {baseLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "block rounded-2xl px-4 py-3 text-base font-medium text-[#3b443b] transition",
                    isActive ? "bg-sage-100/70 text-sage-600" : "hover:bg-cream-100 hover:text-sage-600",
                  )}
                  onClick={closeMenu}
                >
                  {link.title}
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
