import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-10 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">Mindful Wellness</p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Grounded Living – Mindful Health & Lifestyle
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-slate-600">
        Discover actionable insights on mindfulness, nutrition, and intentional living so you can feel rooted in every
        season of life.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/blog"
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:bg-primary-dark"
        >
          Explore the Blog
        </Link>
        <Link
          href="/premium"
          className="rounded-md border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          Join Premium
        </Link>
      </div>
    </section>
  );
}
