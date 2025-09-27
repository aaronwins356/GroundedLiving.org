# Design tokens

Grounded Living’s design tokens live in [`lib/design/tokens.ts`](../../lib/design/tokens.ts) and are surfaced to Tailwind in
[`tailwind.config.ts`](../../tailwind.config.ts). They map directly to CSS custom properties inside
[`app/globals.css`](../../app/globals.css) so authored components, CSS modules, and utility classes stay in sync.

## Color & surfaces

| Token | Value | Usage |
| --- | --- | --- |
| `colors.ink.DEFAULT` | `#13221E` | Primary text, headings, icons |
| `colors.ink.soft` | `rgba(19, 34, 30, 0.78)` | Body copy in muted contexts |
| `colors.moss.500` | `#5B7F6B` | Interactive accent, primary buttons |
| `colors.clay.400` | `#C8A98E` | Secondary accents, callouts |
| `colors.saffron.400` | `#D9A441` | Focus rings, highlights |
| `surface.page` | `var(--color-sand-25)` | Global background |
| `surface.panel` | `rgba(250, 247, 242, 0.92)` | Elevated navigation & cards |

Tailwind exposes these via `bg-surface-panel`, `text-moss-500`, etc., while CSS modules reference the matching variables
(`var(--color-moss)`, `var(--surface-card)`).

## Typography

The responsive type scale is defined as `typeScale` tokens and extended into Tailwind’s `fontSize` map. For example:

```ts
export const typeScale = {
  base: ["clamp(1rem, 0.96rem + 0.22vw, 1.125rem)", { lineHeight: "1.72" }],
  "2xl": ["clamp(1.85rem, 1.5rem + 1.25vw, 2.6rem)", { lineHeight: "1.25" }],
};
```

In prose contexts we rely on the typography plugin overrides (`theme.extend.typography`) so headings inherit Fraunces and
body copy remains Inter with an expanded measure (`max-w-prose`).

## Spacing, radii, and shadows

- `spacingTokens` provide semantic spacing (`space-sm`, `space-xl`) used in `Container`, `Section`, and layout components.
- `radiiTokens` create consistent rounding from `--radius-sm` through `--radius-2xl` and a `pill` alias for buttons and chips.
- `shadowTokens` (`soft`, `floating`, `focus`, `outline`) are shared between global components and CSS modules to keep
  elevation consistent across cards, modals, and callouts.

## Motion

`transitionDurations` and `easingTokens` define editorial motion defaults. Tailwind reads them as custom transition duration
and timing-function utilities (`duration-base`, `ease-standard`), while raw CSS leverages `var(--transition-base)`.

## Component mapping

- **Buttons** consume `var(--radius-pill)`, `var(--transition-base)`, and `shadowTokens` for hover/press states.
- **Callouts** and **NewsletterRibbon** share clay/moss gradients backed by `surface` tokens for airy emphasis.
- **NewsletterForm** uses pill radii and focus shadows; its inline variant drops structural styles so it can live inside
  ribbons, footers, or hero sections without duplication.

These tokens are the single source of truth for future components—extend the TypeScript maps first, then update
`globals.css` (for CSS variables) and Tailwind to keep the system cohesive.
