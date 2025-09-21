import type { Metadata, PageProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "../../../components/sanity/PortableText";

import { getPostBySlug, getPosts } from "../../../lib/sanity.queries";
import { urlForImage } from "../../../lib/sanity.image";

interface BlogPostPageProps extends PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const coverImageUrl = post.coverImage
    ? urlForImage(post.coverImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return {
    title: post.title,
    openGraph: {
      title: post.title,
      type: "article",
      publishedTime: post.publishedAt,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const coverImageUrl = post.coverImage
    ? urlForImage(post.coverImage).width(1600).height(900).fit("crop").auto("format").url()
    : null;

  return (
    <article className="space-y-12">
      {coverImageUrl ? (
        <div className="-mx-4 overflow-hidden rounded-3xl bg-slate-200 sm:-mx-6 lg:-mx-8">
          <Image
            src={coverImageUrl}
            alt={post.title}
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
          <PortableText value={post.content} />
        </div>
      </div>
    </article>
  );
}
