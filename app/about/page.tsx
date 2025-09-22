import type { Metadata } from "next";
import Image from "next/image";

import { PortableTextRenderer } from "../../components/rich-text/PortableTextRenderer";
import { getPageBySlug } from "../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../lib/sanity.image";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the heart behind Grounded Living and discover the story guiding each mindful post.",
};

export default async function AboutPage() {
  const page = await getPageBySlug("about");

  const coverImageUrl = page?.coverImage && hasSanityImageAsset(page.coverImage)
    ? urlForImage(page.coverImage).width(1800).height(900).fit("crop").auto("format").url()
    : null;

  return (
    <article className="space-y-16">
      <section className="overflow-hidden rounded-[2.75rem] bg-white/80 shadow-soft-lg ring-1 ring-brand-100">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6 p-10 sm:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">About Grounded Living</p>
            <h1 className="font-serif text-4xl font-semibold text-accent sm:text-5xl">{page?.title ?? "A gentle welcome"}</h1>
            <p className="text-base leading-relaxed text-accent-soft">
              {page
                ? "This page is fully editable inside Sanity. Update the copy whenever your story or offerings evolve."
                : "Create an About page inside Sanity to introduce yourself. The copy you add there will appear automatically."}
            </p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem]">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={page?.coverImage?.alt ?? page?.title ?? "Calming scene"}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-white to-brand-200" />
            )}
          </div>
        </div>
      </section>

      {page ? (
        <div className="prose prose-lg prose-brand max-w-none rounded-[2.5rem] bg-white/80 p-10 shadow-soft-lg ring-1 ring-brand-100">
          <PortableTextRenderer value={page.content} />
        </div>
      ) : (
        <div className="rounded-[2.5rem] border border-dashed border-brand-200 bg-white/70 p-10 text-accent-soft">
          Add your story, credentials, and mission inside the Sanity Studio (Content → Pages → About) to bring this space to life.
        </div>
      )}
    </article>
  );
}
