import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getPageSummaries } from "@/lib/contentful";
import { NavContent } from "./NavbarContent";

export async function Navbar() {
  const [categories, pages] = await Promise.all([getCategories(), getPageSummaries()]);

  return (
    <Suspense fallback={null}>
      <NavContent categories={categories} pages={pages} />
    </Suspense>
  );
}

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-heading tracking-[0.08em] uppercase text-[#3b443b] transition-opacity hover:opacity-80">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage-200/70 text-sage-500 shadow-inner">
        GL
      </span>
      <span className="hidden sm:block">Grounded Living</span>
    </Link>
  );
}
