import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { RelatedSidebar } from "@/components/sections/RelatedSidebar";
import { buildAbsoluteUrl, getLatestPosts, getPostBySlug, getPosts } from "@/lib/contentful";

interface PostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }

  const description = post.seoDescription ?? post.excerpt ?? "A soulful reflection from Grounded Living.";
  const ogImage = post.coverImage?.url ? [{ url: post.coverImage.url, alt: post.coverImage.alt ?? post.title }] : undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.date,
      url: buildAbsoluteUrl(`/posts/${post.slug}`),
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImage,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getPosts();
  const related = getLatestPosts(
    allPosts.filter((item) => item.slug !== post.slug && item.category?.slug === post.category?.slug),
    0,
    3,
  );

  const coverImage = post.coverImage;

  return (
    <article className="section-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-10">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-sage-500">{post.category?.name ?? "Journal"}</p>
          <h1 className="font-heading text-4xl leading-tight text-[#3b443b] sm:text-5xl">{post.title}</h1>
          <p className="text-sm text-[#4c544c]">{new Date(post.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        {coverImage ? (
          <div className="relative overflow-hidden rounded-[42px] shadow-[0_35px_90px_rgba(169,146,128,0.25)]">
            <Image
              src={coverImage.url}
              alt={coverImage.alt ?? post.title}
              width={coverImage.width ?? 1440}
              height={coverImage.height ?? 960}
              className="h-auto w-full object-cover"
              priority
              placeholder={coverImage.url.startsWith("data:") ? "blur" : undefined}
              blurDataURL={coverImage.url.startsWith("data:") ? coverImage.url : undefined}
            />
          </div>
        ) : null}
        <div className="surface-card px-8 py-10">
          <RichTextRenderer document={post.body} assets={post.assets} />
        </div>
        <div className="flex flex-col items-center justify-between gap-4 rounded-[32px] border border-cream-200 bg-white/70 p-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sage-500">Share the glow</p>
            <p className="font-heading text-xl text-[#3b443b]">Know someone who would love this?</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ShareLink href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildAbsoluteUrl(`/posts/${post.slug}`))}`}>
              Facebook
            </ShareLink>
            <ShareLink href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(buildAbsoluteUrl(`/posts/${post.slug}`))}`}>
              Pinterest
            </ShareLink>
            <ShareLink href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(buildAbsoluteUrl(`/posts/${post.slug}`))}`}>
              Email
            </ShareLink>
          </div>
        </div>
      </div>
      <RelatedSidebar posts={related.length > 0 ? related : getLatestPosts(allPosts.filter((item) => item.slug !== post.slug), 0, 3)} />
    </article>
  );
}

type ShareLinkProps = {
  href: string;
  children: ReactNode;
};

function ShareLink({ href, children }: ShareLinkProps) {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-sage-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sage-500 transition hover:border-sage-400 hover:bg-sage-100/80 hover:text-sage-600"
    >
      {children}
    </Link>
  );
}
