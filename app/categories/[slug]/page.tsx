import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getCategories, getBlogPostsByCategory, buildAbsoluteUrl, CONTENTFUL_REVALIDATE_INTERVAL } from "@/lib/contentful";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import { RelatedSidebar } from "@/components/sections/RelatedSidebar";
import { Seo } from "@/components/seo/Seo";
import { formatDate } from "@/lib/contentful";

interface CategoryPageProps {
  params: { slug: string };
}

export const revalidate = CONTENTFUL_REVALIDATE_INTERVAL;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    return { title: "Category not found" };
  }

  const canonical = buildAbsoluteUrl(`/categories/${category.slug}`);

  return {
    title: `${category.name} Stories`,
    description: category.description ?? `Browse rituals and recipes curated for ${category.name}.`,
    alternates: { canonical },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);

  if (!category) {
    notFound();
  }

  const posts = await getBlogPostsByCategory(category.slug);

  const heroPost = posts[0];
  const supporting = posts.slice(1, 4);
  const others = posts.slice(4);

  const canonical = buildAbsoluteUrl(`/categories/${category.slug}`);

  return (
    <div className="section-shell space-y-12">
      <Seo
        title={`${category.name} Stories`}
        description={category.description ?? undefined}
        canonical={canonical}
        openGraph={{ url: canonical, type: "website" }}
      />
      <header className="surface-card flex flex-col gap-4 px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-sage-500">Category</p>
        <h1 className="font-heading text-4xl text-[#3b443b]">{category.name}</h1>
        {category.description ? <p className="text-sm text-[#4c544c]">{category.description}</p> : null}
        <div className="flex flex-wrap justify-center gap-2">
          {categories
            .filter((item) => item.slug !== category.slug)
            .map((item) => (
              <Link key={item.slug} href={`/categories/${item.slug}`} className="tag-pill text-xs uppercase tracking-[0.14em]">
                {item.name}
              </Link>
            ))}
        </div>
      </header>

      {heroPost ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="surface-card overflow-hidden rounded-[36px]">
            {heroPost.coverImage ? (
              <div className="relative h-80">
                <Image
                  src={heroPost.coverImage.url}
                  alt={heroPost.coverImage.alt ?? heroPost.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-4 px-8 py-6">
              <p className="text-xs uppercase tracking-[0.35em] text-sage-500">Featured</p>
              <h2 className="font-heading text-3xl text-[#3b443b]">
                <Link href={`/blog/${heroPost.slug}`}>{heroPost.title}</Link>
              </h2>
              {heroPost.excerpt ? <p className="text-sm text-[#4c544c]">{heroPost.excerpt}</p> : null}
              <p className="text-xs text-[#4c544c]">{formatDate(heroPost.datePublished)}</p>
              <Link
                href={`/blog/${heroPost.slug}`}
                className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-sage-500 transition hover:text-sage-600"
              >
                Read story
              </Link>
            </div>
          </div>
          <RelatedSidebar posts={supporting} title="More in this intention" />
        </div>
      ) : (
        <p className="text-center text-sm text-[#4c544c]">Posts are brewing. Check back soon for new rituals.</p>
      )}

      {others.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {others.map((post) => (
            <article key={post.id} className="surface-card flex flex-col overflow-hidden">
              {post.coverImage ? (
                <div className="relative h-56">
                  <Image
                    src={post.coverImage.url}
                    alt={post.coverImage.alt ?? post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="space-y-3 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.35em] text-sage-500">{formatDate(post.datePublished)}</p>
                <h3 className="font-heading text-2xl text-[#3b443b]">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.excerpt ? <p className="text-sm text-[#4c544c]">{post.excerpt}</p> : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <NewsletterSignup
        endpoint={process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT}
        providerLabel={process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "newsletter"}
      />
    </div>
  );
}
