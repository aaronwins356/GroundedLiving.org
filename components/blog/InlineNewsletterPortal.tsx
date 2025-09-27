"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { NewsletterForm } from "@/components/ui/NewsletterForm";

interface InlineNewsletterPortalProps {
  slug: string;
}

interface InlineVariant {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  submitLabel: string;
  hint: string;
  successRedirect: string;
  tag: string;
}

const INLINE_VARIANTS: InlineVariant[] = [
  {
    id: "herbal-remedies",
    eyebrow: "Free download",
    title: "5 Herbal Remedies for Cold Season",
    body: "Build a gentle apothecary at home with clinically backed herbs, dosing tips, and safety notes.",
    bullets: [
      "Immune-supporting teas & tonics",
      "When to reach for elderberry vs. echinacea",
      "Contraindications to watch for",
    ],
    submitLabel: "Send me the PDF",
    hint: "We’ll email the guide and a weekly ritual note. Unsubscribe anytime.",
    successRedirect: "/thank-you?lg=herbal-remedies-cold-season",
    tag: "lead-magnet:herbal-remedies",
  },
  {
    id: "whole-food-breakfasts",
    eyebrow: "7-day reset",
    title: "Whole-Food Breakfast Blueprint",
    body: "Seven make-ahead breakfasts that balance blood sugar, reduce morning stress, and taste like comfort.",
    bullets: [
      "Dietitian-reviewed macro breakdowns",
      "Batch-prep notes for busy weeks",
      "Swap suggestions for seasonal produce",
    ],
    submitLabel: "Email the breakfast plan",
    hint: "No spam—just nourishing recipes and gentle accountability.",
    successRedirect: "/thank-you?lg=whole-food-breakfast-blueprint",
    tag: "lead-magnet:whole-food-breakfasts",
  },
];

function hashSlug(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function InlineNewsletterPortal({ slug }: InlineNewsletterPortalProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const variant = useMemo(() => {
    if (INLINE_VARIANTS.length === 0) {
      throw new Error("Inline newsletter variants must be configured");
    }
    const index = hashSlug(slug) % INLINE_VARIANTS.length;
    return INLINE_VARIANTS[index];
  }, [slug]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const root = document.querySelector<HTMLElement>(".post-body");
    if (!root) {
      return undefined;
    }

    const element = document.createElement("div");
    element.className = "post-inline-newsletter not-prose";
    element.dataset.variant = variant.id;

    const headings = root.querySelectorAll<HTMLElement>(".rt-heading-2");
    const target = headings[1] ?? headings[0];

    if (target) {
      target.insertAdjacentElement("afterend", element);
    } else {
      root.appendChild(element);
    }

    setContainer(element);

    return () => {
      element.remove();
      setContainer(null);
    };
  }, [variant]);

  if (!container) {
    return null;
  }

  return createPortal(<InlineNewsletter variant={variant} />, container);
}

function InlineNewsletter({ variant }: { variant: InlineVariant }) {
  return (
    <aside className="inline-newsletter" aria-label="Join the Grounded Living newsletter">
      <p className="inline-newsletter__eyebrow">{variant.eyebrow}</p>
      <h2 className="inline-newsletter__title">{variant.title}</h2>
      <p className="inline-newsletter__body">{variant.body}</p>
      <ul className="inline-newsletter__bullets">
        {variant.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <NewsletterForm
        variant="inline"
        hideLabel
        submitLabel={variant.submitLabel}
        hint={variant.hint}
        source="post-inline"
        successRedirect={variant.successRedirect}
        tag={variant.tag}
      />
    </aside>
  );
}
