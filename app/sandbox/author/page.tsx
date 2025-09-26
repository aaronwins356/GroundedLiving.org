import { ArticleShell } from "@/components/blog/ArticleShell";
import { AuthorCard } from "@/components/site/AuthorCard";
import { RichText } from "@/lib/richtext";
import type { RichTextDocument } from "@/types/contentful";

const demoBio: RichTextDocument = {
  nodeType: "document",
  data: {},
  content: [
    {
      nodeType: "paragraph",
      data: {},
      content: [
        { nodeType: "text", value: "This short bio demonstrates how the AuthorCard renders Contentful Rich Text.", marks: [], data: {} },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "It inherits the same typography system used on editorial pages while keeping links and lists accessible.",
          marks: [],
          data: {},
        },
      ],
    },
  ],
};

export const metadata = {
  title: "Sandbox – AuthorCard",
};

export default function AuthorSandboxPage() {
  return (
    <ArticleShell className="page-shell" innerClassName="page-article">
      <div className="prose">
        <h1>AuthorCard sandbox</h1>
        <p>Use this page to preview the author module in isolation.</p>
      </div>
      <div className="not-prose">
        <AuthorCard
          name="Alex Rivers"
          headshotUrl="/images/author-placeholder.svg"
          links={{ linkedIn: "https://www.linkedin.com", instagram: "https://www.instagram.com" }}
          bioRichText={demoBio}
        />
      </div>
      <RichText document={demoBio} />
    </ArticleShell>
  );
}
