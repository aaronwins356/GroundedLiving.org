import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type InfographicTheme = "moss" | "spruce" | "saffron" | "linen";

export interface InfographicCardItem {
  title: string;
  description?: string | null;
}

export interface InfographicCardProps {
  id?: string;
  eyebrow?: string | null;
  title: string;
  summary?: string | null;
  items: InfographicCardItem[];
  footnote?: string | null;
  theme?: InfographicTheme;
  className?: string;
  media?: ReactNode;
}

const themeClassMap: Record<InfographicTheme, string> = {
  moss: "infographic-card--moss",
  spruce: "infographic-card--spruce",
  saffron: "infographic-card--saffron",
  linen: "infographic-card--linen",
};

export function InfographicCard({
  id,
  eyebrow,
  title,
  summary,
  items,
  footnote,
  theme = "linen",
  className,
  media,
}: InfographicCardProps) {
  const hasMedia = Boolean(media);
  const headingId = (id && sanitizeId(id)) || slugifyId(title);

  return (
    <section
      className={cn("infographic-card", themeClassMap[theme], hasMedia && "infographic-card--with-media", className)}
      aria-labelledby={headingId}
      role="region"
    >
      <div className="infographic-card__body">
        {eyebrow ? (
          <p className="infographic-card__eyebrow" aria-label={eyebrow}>
            {eyebrow}
          </p>
        ) : null}
        <h2 id={headingId} className="infographic-card__title">
          {title}
        </h2>
        {summary ? <p className="infographic-card__summary">{summary}</p> : null}
        <ol className="infographic-card__list">
          {items.map((item) => (
            <li key={item.title} className="infographic-card__list-item">
              <div className="infographic-card__marker" aria-hidden />
              <div>
                <h3 className="infographic-card__item-title">{item.title}</h3>
                {item.description ? <p className="infographic-card__item-description">{item.description}</p> : null}
              </div>
            </li>
          ))}
        </ol>
        {footnote ? <p className="infographic-card__footnote">{footnote}</p> : null}
      </div>
      {hasMedia ? <div className="infographic-card__media">{media}</div> : null}
    </section>
  );
}

function slugifyId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}
