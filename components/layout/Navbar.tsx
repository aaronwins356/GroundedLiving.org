"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop (coming soon)" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/60 bg-cream/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-[0.28em] text-emerald-700">
          Grounded Living
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 lg:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative pb-1 transition ${
                  isActive
                    ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-100 after:bg-emerald-500"
                    : "hover:text-emerald-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-emerald-400 after:transition-transform hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200/70 text-emerald-700 transition hover:border-emerald-400 hover:bg-white lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6">
            {isOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {isOpen ? (
        <div className="border-t border-emerald-100/60 bg-cream/95 px-6 py-4 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-emerald-800"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
