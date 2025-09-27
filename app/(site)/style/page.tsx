import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { Section } from "@/components/ui/Section";
import {
  colorTokens,
  spacingTokens,
  typeScale,
} from "@/lib/design/tokens";
import { cn } from "@/lib/utils/cn";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";

const PAGE_TITLE = buildMetaTitle("Design system");
const PAGE_DESCRIPTION = truncateAtBoundary(
  "Grounded Living’s design language—color, typography, spacing, and core interaction patterns—documented for designers and engineers.",
  155,
);

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
};

const paletteGroups = [
  {
    name: "Stone neutrals",
    description: "Canvas, cards, and quiet surfaces.",
    swatches: Object.entries(colorTokens.stone).map(([token, value]) => ({
      token: `colors.stone.${token}`,
      value,
    })),
  },
  {
    name: "Moss & fern",
    description: "Primary greens for brand moments and interactive accents.",
    swatches: [
      ...Object.entries(colorTokens.moss).map(([token, value]) => ({
        token: `colors.moss.${token}`,
        value,
      })),
      ...Object.entries(colorTokens.fern).map(([token, value]) => ({
        token: `colors.fern.${token}`,
        value,
      })),
    ],
  },
  {
    name: "Clay & saffron",
    description: "Editorial warmth and call-to-action highlights.",
    swatches: [
      ...Object.entries(colorTokens.clay).map(([token, value]) => ({
        token: `colors.clay.${token}`,
        value,
      })),
      ...Object.entries(colorTokens.saffron).map(([token, value]) => ({
        token: `colors.saffron.${token}`,
        value,
      })),
    ],
  },
] as const;

const spacingEntries = Object.entries(spacingTokens) as Array<[string, string]>;

const typeEntries = Object.entries(typeScale) as Array<[
  string,
  readonly [string, { readonly lineHeight: string }],
]>;

const sampleCopy =
  "Grounded Living is an editorial home for rituals, recipes, and tools that help you slow down and nourish well.";

export default function DesignSystemPage() {
  return (
    <Section className="bg-surface-canvas">
      <Container className="prose prose-neutral max-w-none">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss-600">Design System</p>
        <h1 className="font-display text-4xl">Grounded Living UI foundations</h1>
        <p className="text-lg text-ink-soft md:w-4/6">
          A living reference for Grounded Living’s mobile-first design language—crafted to feel calm, credible, and editorial.
          Use these tokens and components across Next.js, Storybook, and marketing touchpoints.
        </p>

        <div className="mt-16 grid gap-16">
          <section aria-labelledby="palette-heading" className="space-y-8">
            <div>
              <h2 id="palette-heading" className="font-display text-3xl">
                Palette
              </h2>
              <p className="text-ink-muted md:w-2/3">
                Herbaceous greens and stone neutrals create a grounded canvas. Clay and saffron bring warmth to CTAs without
                overwhelming content.
              </p>
            </div>
            <div className="grid gap-10">
              {paletteGroups.map((group) => (
                <div key={group.name} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-2xl">{group.name}</h3>
                    <p className="text-ink-muted">{group.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {group.swatches.map((swatch) => (
                      <figure
                        key={`${group.name}-${swatch.token}`}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-ink/5 bg-white/80 p-4 shadow-sm"
                      >
                        <div
                          className="h-20 w-full rounded-lg"
                          style={{ background: swatch.value }}
                          aria-hidden
                        />
                        <figcaption className="space-y-1 text-sm">
                          <p className="font-semibold tracking-wide text-ink-soft">{swatch.token}</p>
                          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-subtle">{swatch.value}</p>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="type-heading" className="space-y-6">
            <div>
              <h2 id="type-heading" className="font-display text-3xl">
                Typography scale
              </h2>
              <p className="text-ink-muted md:w-2/3">
                Clamp-based sizing keeps copy legible from 320px → 1440px. Headings tighten for hierarchy, while body copy stays
                relaxed for long-form reading.
              </p>
            </div>
            <div className="grid gap-6">
              {typeEntries.map(([token, [size, options]]) => (
                <article
                  key={token}
                  className="rounded-2xl border border-ink/5 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <header className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-ink-subtle">{token}</h3>
                    <p className="text-xs text-ink-muted">
                      {size} / line-height {options.lineHeight}
                    </p>
                  </header>
                  <p
                    className={cn(
                      "mt-4 text-ink",
                      token === "display"
                        ? "font-display text-display"
                        : token === "4xl"
                        ? "font-display text-4xl"
                        : token === "3xl"
                        ? "font-display text-3xl"
                        : token === "2xl"
                        ? "font-display text-2xl"
                        : token === "xl"
                        ? "font-display text-xl"
                        : token === "lg"
                        ? "text-lg"
                        : token === "lead"
                        ? "text-lead"
                        : token === "base"
                        ? "text-base"
                        : token === "sm"
                        ? "text-sm"
                        : "text-xs",
                    )}
                    style={{ lineHeight: options.lineHeight }}
                  >
                    {sampleCopy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="spacing-heading" className="space-y-6">
            <div>
              <h2 id="spacing-heading" className="font-display text-3xl">
                Spacing rhythm
              </h2>
              <p className="text-ink-muted md:w-2/3">
                Semantic names map to a 4px base grid. Use them for consistent gutters, padding, and section spacing.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {spacingEntries.map(([token, value]) => (
                <div key={token} className="rounded-2xl border border-ink/5 bg-white/90 p-5 shadow-sm">
                  <p className="font-semibold text-ink-soft">space-{token}</p>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-subtle">{value}</p>
                  <div className="mt-4 flex h-2 items-center gap-2">
                    <span className="inline-block h-2 rounded-full bg-moss-300" style={{ width: `calc(${value} * 3)` }} />
                    <span className="inline-block text-xs text-ink-muted">visualized</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="components-heading" className="space-y-6">
            <div>
              <h2 id="components-heading" className="font-display text-3xl">
                Component snapshots
              </h2>
              <p className="text-ink-muted md:w-2/3">
                Core UI primitives that power navigation, conversion, and editorial storytelling. Each ships with accessible
                defaults and responsive behavior.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-3xl border border-ink/6 bg-white/90 p-6 shadow-md">
                <h3 className="font-display text-2xl">Buttons</h3>
                <p className="text-sm text-ink-muted">
                  Primary actions lean moss, while secondary/ghost variants provide soft emphasis.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button>Primary action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              <div className="rounded-3xl border border-ink/6 bg-white/90 p-6 shadow-md">
                <h3 className="font-display text-2xl">Callout</h3>
                <Callout className="mt-4">
                  <strong>Ingredient spotlight.</strong> Swap refined sugar for maple syrup to keep minerals intact while adding
                  round caramel notes to your morning oats.
                </Callout>
              </div>
              <div className="rounded-3xl border border-ink/6 bg-white/90 p-6 shadow-md">
                <h3 className="font-display text-2xl">Newsletter CTA</h3>
                <NewsletterForm
                  variant="inline"
                  submitLabel="Join the journal"
                  hint="One mindful email each week. No noise."
                  source="style-guide"
                />
              </div>
              <div className="rounded-3xl border border-ink/6 bg-white/90 p-6 shadow-md">
                <h3 className="font-display text-2xl">Related content</h3>
                <div className="mt-4 space-y-4">
                  {[1, 2, 3].map((item) => (
                    <article key={item} className="flex flex-col gap-2 rounded-2xl bg-surface-subtle p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-moss-500">Wellness</p>
                      <h4 className="font-display text-lg leading-snug text-ink">
                        Evenings Unplugged: Rituals to signal a slower nervous system
                      </h4>
                      <p className="text-sm text-ink-muted">
                        A 15-minute sequence of herbs, breath, and journaling prompts to ease into restorative sleep.
                      </p>
                      <Link href="#" className="text-sm font-semibold text-moss-600 underline-offset-4 hover:underline">
                        Read next
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </Section>
  );
}
