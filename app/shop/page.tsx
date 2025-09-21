import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shop",
  description: "Future home of soulful wellness products, digital guides, and curated affiliate offerings.",
};

export default function ShopPage() {
  return (
    <section className="space-y-6 rounded-3xl bg-white/70 p-12 text-center shadow-soft-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">Shop</p>
      <h1 className="text-4xl font-semibold text-accent">Coming soon</h1>
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-accent-soft">
        We’re curating mindful tools, plant-powered recipes, and cozy rituals to support your grounded lifestyle. Check back
        soon or explore the latest stories in the meantime.
      </p>
      <div className="flex justify-center">
        <Link href="/blog" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Visit the blog
        </Link>
      </div>
    </section>
  );
}
