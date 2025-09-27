import type { TableOfContentsItem } from "@/lib/richtext";

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  minItems?: number;
}

export function TableOfContents({ items, minItems = 3 }: TableOfContentsProps) {
  const filtered = items.filter((item) => item.level === 2 || item.level === 3);
  if (filtered.length < minItems) {
    return null;
  }

  return (
    <nav className="post-toc" aria-label="Table of contents">
      <div className="post-toc__inner">
        <div className="post-toc__header">
          <span className="post-toc__eyebrow">On this page</span>
          <h2 className="post-toc__heading">In this article</h2>
        </div>
        <ol className="post-toc__list">
          {filtered.map((item) => (
            <li key={item.id} className={`post-toc__item post-toc__item--level-${item.level}`}>
              <a href={`#${item.id}`}>{item.title}</a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
