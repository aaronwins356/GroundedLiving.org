import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { buildAbsoluteUrl, getPageBySlug, getPages } from "@/lib/contentful";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const pages = (await getPages()) as { slug: string }[];
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return { title: "Page not found" };
  }

  const description = page.content ? `Grounded Living – ${page.title}` : "Grounded Living";

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      url: buildAbsoluteUrl(`/pages/${page.slug}`),
    },
  };
}

export default async function StaticPage({ params }: PageProps) {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    notFound();
  }

  return (
    <section className="section-shell">
      <div className="surface-card px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl text-[#3b443b]">{page.title}</h1>
        </div>
        <RichTextRenderer document={page.content} />
      </div>
    </section>
  );
}
