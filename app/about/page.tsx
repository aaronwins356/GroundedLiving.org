import type { Metadata } from "next";
import Image from "next/image";
import { PrismicRichText } from "../../components/prismic/RichText";

import { getPageByUID } from "../../lib/prismic";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the heart behind Grounded Living and discover the story guiding each mindful post.",
};

export default async function AboutPage() {
  const page = await getPageByUID("about");

  return (
    <article className="space-y-16 text-emerald-950">
      <section className="grid gap-10 rounded-[3rem] bg-gradient-to-br from-emerald-100 via-white to-rose-100 p-12 shadow-[0_50px_140px_rgba(150,170,160,0.2)] ring-1 ring-emerald-100/70 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">About Grounded Living</span>
          <h1 className="font-serif text-4xl tracking-tight text-emerald-950">
            {page?.title ?? "A gentle welcome"}
          </h1>
          <p className="text-lg leading-relaxed text-emerald-900/70">
            {page
              ? "This page is fully editable inside Prismic. Update the copy whenever your story or offerings evolve."
              : "Create an About page inside Prismic to introduce yourself. The copy you add there will appear automatically."}
          </p>
        </div>
        <div className="relative h-80 overflow-hidden rounded-[2.5rem] bg-white/60 shadow-[0_40px_120px_rgba(150,170,160,0.18)] ring-1 ring-emerald-100/70">
          {page?.coverImage?.url ? (
            <Image
              src={page.coverImage.url}
              alt={page.coverImage.alt ?? page.title ?? "Calming scene"}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-emerald-50 via-white to-rose-100" />
          )}
        </div>
      </section>

      {page ? (
        <div className="rounded-[3rem] bg-white/90 p-12 shadow-[0_40px_120px_rgba(160,180,170,0.18)] ring-1 ring-emerald-100/70">
          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-emerald-950 prose-p:text-slate-700">
            <PrismicRichText field={page.content} />
          </div>
        </div>
      ) : (
        <div className="rounded-[3rem] bg-white/80 p-12 text-center text-lg text-emerald-800/80 ring-1 ring-emerald-100/70">
          Add your story, credentials, and mission inside Prismic to bring this space to life.
        </div>
      )}
    </article>
  );
}
