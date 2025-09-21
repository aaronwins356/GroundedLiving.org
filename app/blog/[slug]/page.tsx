import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { ReactNode } from "react";

import { getPostBySlug, getPosts } from "../../../lib/sanity.queries";
import { hasSanityImageAsset, urlForImage } from "../../../lib/sanity.image";
import type { SanityImageWithAlt } from "../../../lib/sanity.image";

type BlogPostPageParams = {
  params: {
    slug: string;
  };
};

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value?: SanityImageWithAlt }) => {
      if (!value || !hasSanityImageAsset(value)) {
        return null;
      }

      const imageUrl = urlForImage(value).width(1200).fit("max").auto("format").url();

      return (
        <figure className="my-10 overflow-hidden rounded-3xl bg-slate-100">
          <Image
            src={imageUrl}
            alt={value.alt ?? "Blog post illustration"}
            width={1200}
            height={800}
            sizes="(min-width: 1024px) 768px, 100vw"
            className="h-auto w-full object-cover"
          />
          {value.alt ? (
            <figcaption className="px-6 pb-6 pt-3 text-center text-sm text-slate-500">{value.alt}</figcaption>
          ) : null}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => <h2 className="text-3xl font-semibold text-slate-900">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold text-slate-900">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-semibold text-slate-900">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/60 bg-primary/5 px-6 py-4 text-lg italic text-primary-dark">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="leading-relaxed">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    code: ({ children }) => (
      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm">{children}</code>
    ),
    link: ({ children, value }: { children: ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition hover:text-primary-dark"
      >
        {children}
      </a>
    ),
  },
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageParams): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const coverImageUrl = hasSanityImageAsset(post.coverImage)
    ? urlForImage(post.coverImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageParams) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const coverImageUrl = hasSanityImageAsset(post.coverImage)
    ? urlForImage(post.coverImage).width(1600).height(900).fit("crop").auto("format").url()
    : null;

  return (
    <article className="space-y-12">
      {coverImageUrl ? (
        <div className="-mx-4 overflow-hidden rounded-3xl bg-slate-200 sm:-mx-6 lg:-mx-8">
          <Image
            src={coverImageUrl}
            alt={post.coverImage?.alt ?? post.title}
            width={1600}
            height={900}
            className="h-80 w-full object-cover sm:h-[26rem]"
            priority
          />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          <span aria-hidden>←</span> Back to Blog
        </Link>
        <header className="space-y-4 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
          <p className="text-sm text-slate-500">
            <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString()}</time>
          </p>
        </header>
        <div className="prose prose-lg prose-slate mx-auto w-full text-left">
          <PortableText value={post.content} components={portableTextComponents} />
        </div>
      </div>
    </article>
  );
}
