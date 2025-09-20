import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import parse, { DOMNode, Element, domToReact } from "html-react-parser";
import { getPostBySlug, getPostSlugs } from "../../../lib/posts";
import { AffiliateLink } from "../../../components/ui/AffiliateLink";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug: path.parse(slug).name }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      openGraph: {
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        type: "article",
        publishedTime: post.frontmatter.date,
        tags: post.frontmatter.tags,
        images: post.frontmatter.image ? [post.frontmatter.image] : undefined,
      },
    };
  } catch {
    return {
      title: "Post not found",
    };
  }
}

function renderContent(html: string) {
  return parse(html, {
    replace: (node: DOMNode) => {
      if (node.type === "tag" && node.name === "a") {
        const element = node as Element;
        const { href, target: _target, rel: _rel, ...rest } = element.attribs ?? {};
        return (
          <AffiliateLink href={href} {...(rest as Record<string, string>)}>
            {domToReact(element.children)}
          </AffiliateLink>
        );
      }
      return undefined;
    },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });

  try {
    const post = await getPostBySlug(slug);

    return (
      <article className="space-y-12">
        {post.frontmatter.image ? (
          <div className="-mx-4 overflow-hidden rounded-3xl bg-slate-200 sm:-mx-6 lg:-mx-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.frontmatter.image}
              alt={post.frontmatter.title}
              className="h-80 w-full object-cover sm:h-[26rem]"
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
            {post.frontmatter.category ? (
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                {post.frontmatter.category}
              </p>
            ) : null}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {post.frontmatter.title}
            </h1>
            <p className="text-sm text-slate-500">
              <time dateTime={post.frontmatter.date}>{formatter.format(new Date(post.frontmatter.date))}</time>
            </p>
          </header>
          <div className="prose prose-lg prose-slate mx-auto w-full text-left">
            {renderContent(post.content)}
          </div>
          {post.frontmatter.tags?.length ? (
            <ul className="not-prose flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {post.frontmatter.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
