"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { buttonClassNames } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecipeMeta {
  prep: string;
  cook: string;
  total: string;
  yield: string;
}

interface RecipeSection {
  heading?: string;
  items: readonly string[];
}

interface RecipeStep {
  title?: string;
  description: string;
}

export interface RecipeLayoutProps {
  title: string;
  description: string;
  hero: {
    src: string;
    alt: string;
  };
  meta: RecipeMeta;
  ingredients: readonly RecipeSection[];
  steps: readonly RecipeStep[];
  tags?: readonly string[];
  tips?: ReactNode;
}

export function RecipeLayout({
  title,
  description,
  hero,
  meta,
  ingredients,
  steps,
  tags,
  tips,
}: RecipeLayoutProps) {
  return (
    <article className="recipe-layout" aria-labelledby="recipe-title">
      <div className="recipe-layout__hero">
        <div className="recipe-layout__image">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            className="fade-media object-cover"
            sizes="(min-width: 1024px) 640px, 100vw"
            priority
            onLoadingComplete={(img) => img.classList.add("is-loaded")}
          />
        </div>
        <div className="recipe-layout__intro">
          <p className="recipe-layout__eyebrow">Seasonal Recipe</p>
          <h1 id="recipe-title">{title}</h1>
          <p className="recipe-layout__lede">{description}</p>
          <div className="recipe-layout__meta">
            <div>
              <span>Prep</span>
              <strong>{meta.prep}</strong>
            </div>
            <div>
              <span>Cook</span>
              <strong>{meta.cook}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{meta.total}</strong>
            </div>
            <div>
              <span>Yield</span>
              <strong>{meta.yield}</strong>
            </div>
          </div>
          <a
            href="#recipe-card"
            className={buttonClassNames({ variant: "secondary", size: "md", className: "recipe-layout__jump" })}
            onClick={(event) => {
              if (typeof document === "undefined") {
                return;
              }
              const target = document.getElementById("recipe-card");
              if (!target) {
                return;
              }
              event.preventDefault();
              const previousTabIndex = target.getAttribute("tabindex");
              target.setAttribute("tabindex", "-1");
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              target.focus({ preventScroll: true });
              target.addEventListener(
                "blur",
                () => {
                  if (previousTabIndex === null) {
                    target.removeAttribute("tabindex");
                  } else {
                    target.setAttribute("tabindex", previousTabIndex);
                  }
                },
                { once: true },
              );
            }}
          >
            Jump to recipe
          </a>
          {tags && tags.length ? (
            <ul className="recipe-layout__tags" aria-label="Recipe tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="recipe-layout__content" id="recipe-card">
        <Card tone="linen" className="recipe-layout__card" interactive>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="recipe-layout__ingredients">
              {ingredients.map((section) => (
                <div key={section.heading ?? section.items.join("-")} className="recipe-layout__ingredients-section">
                  {section.heading ? <h3>{section.heading}</h3> : null}
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="recipe-layout__steps" aria-label="Method">
          <h2>Method</h2>
          <ol>
            {steps.map((step, index) => (
              <li key={step.title ?? index}>
                <div className="recipe-layout__step-heading">
                  <span className="recipe-layout__step-number">{index + 1}</span>
                  {step.title ? <h3>{step.title}</h3> : null}
                </div>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {tips ? (
          <aside className="recipe-layout__tips" aria-label="Chef notes">
            <h2>Chef notes</h2>
            <div className="recipe-layout__tips-body">{tips}</div>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
