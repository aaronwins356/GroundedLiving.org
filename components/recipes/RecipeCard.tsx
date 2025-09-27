"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export interface RecipeCardProps {
  title: string;
  description: string;
  href: string;
  image: {
    src: string;
    alt: string;
  };
  meta: {
    prep: string;
    cook: string;
    yield: string;
  };
  className?: string;
}

export function RecipeCard({ title, description, href, image, meta, className }: RecipeCardProps) {
  return (
    <article className={cn("recipe-card", className)}>
      <Link href={href} className="recipe-card__media" aria-label={`View recipe for ${title}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="fade-media object-cover"
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 90vw"
          onLoadingComplete={(img) => img.classList.add("is-loaded")}
        />
      </Link>
      <div className="recipe-card__body">
        <p className="recipe-card__eyebrow">Kitchen ritual</p>
        <h3 className="recipe-card__title">
          <Link href={href}>{title}</Link>
        </h3>
        <p className="recipe-card__description">{description}</p>
        <dl className="recipe-card__meta">
          <div>
            <dt>Prep</dt>
            <dd>{meta.prep}</dd>
          </div>
          <div>
            <dt>Cook</dt>
            <dd>{meta.cook}</dd>
          </div>
          <div>
            <dt>Yield</dt>
            <dd>{meta.yield}</dd>
          </div>
        </dl>
        <Link href={href} className="recipe-card__cta">
          Print &amp; save recipe
        </Link>
      </div>
    </article>
  );
}
