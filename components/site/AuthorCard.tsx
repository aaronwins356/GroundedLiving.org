import Image from "next/image";
import type { ReactNode } from "react";

import { RichText } from "@/lib/richtext";
import type { RichTextDocument } from "@/types/contentful";
import { buildContentfulImageUrl } from "@/lib/images";

interface AuthorCardProps {
  name: string;
  headshotUrl?: string;
  links?: {
    linkedIn?: string | null;
    instagram?: string | null;
  } | null;
  bioRichText?: RichTextDocument | null;
  bio?: ReactNode;
}

const SOCIAL_LABELS: Record<string, string> = {
  linkedIn: "LinkedIn",
  instagram: "Instagram",
};

export function AuthorCard({ name, headshotUrl, links, bioRichText, bio }: AuthorCardProps) {
  const headshotBase = headshotUrl?.trim();
  const headshot = headshotBase?.includes("ctfassets.net")
    ? buildContentfulImageUrl(headshotBase, { width: 256, height: 256, fit: "thumb" })
    : headshotBase;
  const initials = name
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const socialEntries = Object.entries(links ?? {}).filter(([, url]) => Boolean(url));

  return (
    <figure className="author-card">
      <div className="author-card__media" aria-hidden={!headshot}>
        {headshot ? (
          <Image
            src={headshot}
            alt={`Portrait of ${name}`}
            width={128}
            height={128}
            className="author-card__image"
            sizes="128px"
          />
        ) : (
          <span className="author-card__initials" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
      <figcaption className="author-card__content">
        <p className="author-card__eyebrow">Meet the author</p>
        <h2 className="author-card__name">{name}</h2>
        {bioRichText ? (
          <RichText document={bioRichText} withProse={false} className="author-card__bio" />
        ) : bio ? (
          <div className="author-card__bio">{bio}</div>
        ) : null}
        {socialEntries.length > 0 ? (
          <ul className="author-card__links">
            {socialEntries.map(([network, url]) => (
              <li key={network}>
                <a href={url as string} target="_blank" rel="noopener noreferrer">
                  {SOCIAL_LABELS[network] ?? network}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </figcaption>
    </figure>
  );
}
