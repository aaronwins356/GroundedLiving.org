import path from "node:path";
import type { Metadata } from "next";
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
      <article className="prose prose-slate mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-primary">{post.frontmatter.category}</p>
        <h1>{post.frontmatter.title}</h1>
        <p className="text-sm text-slate-500">
          <time dateTime={post.frontmatter.date}>{formatter.format(new Date(post.frontmatter.date))}</time>
        </p>
        {renderContent(post.content)}
        {post.frontmatter.tags?.length ? (
          <ul className="not-prose mt-8 flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {post.frontmatter.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
