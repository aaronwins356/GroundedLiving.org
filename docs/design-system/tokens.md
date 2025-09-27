# Design tokens

Grounded Living’s tokens are defined in [`lib/design/tokens.ts`](../../lib/design/tokens.ts) and mirrored as a portable
JSON source of truth in [`lib/design/tokens.json`](../../lib/design/tokens.json). The Tailwind layer consumes them via
[`tailwind.config.ts`](../../tailwind.config.ts) while CSS custom properties are emitted in
[`app/globals.css`](../../app/globals.css), ensuring React components, Markdown prose, and legacy CSS modules stay
perfectly aligned.

## Palette & semantic surfaces

| Token | Value | Usage |
| --- | --- | --- |
| `colors.stone.50` | `#FAF7F2` | Canvas background, neutral cards |
| `colors.stone.900` | `#26211C` | Deep overlays, dark text on warm panels |
| `colors.moss.500` | `#5B7F6B` | Primary brand actions, interactive states |
| `colors.fern.400` | `#8AB794` | Secondary accents, badges, wellness tags |
| `colors.clay.400` | `#C8A98E` | Editorial highlights, pull quotes |
| `colors.saffron.500` | `#C58A2F` | Primary CTA + focus outline |
| `colors.success.500` | `#3F7A49` | Confirmation banners, success toasts |
| `colors.danger.500` | `#B9503B` | Error states, destructive actions |
| `surface.page` | `var(--color-stone-25)` | Global background |
| `surface.panel` | `rgba(250, 247, 242, 0.92)` | Sticky nav, TOC, light cards |
| `surface.overlay` | `rgba(19, 34, 30, 0.36)` | Scrims for modals, mobile nav |

All surfaces hit AA contrast with the ink family while maintaining airy warmth. Tailwind utilities such as `bg-surface-card`
and `text-moss-600` map 1:1 to CSS variables (`var(--surface-card)`, `var(--color-moss-600)`), making authored
prose and component styles visually identical.

## Typography system

- **Scale.** Responsive clamp-based sizes from `font-size-xs` (micro copy) through `font-size-display` (hero headlines) keep
  the editorial rhythm consistent across breakpoints.
- **Line heights.** `lineHeightScale` exposes `tight`, `snug`, `relaxed`, and `loose` tokens so long-form body copy defaults
  to a 1.65–1.7 rhythm while display headings tighten for confident hierarchy.
- **Families & weights.** `fontFamilyTokens` pair Fraunces for headlines with Inter for body copy, limited to regular,
  medium, semibold, and bold weights (`fontWeightTokens`) to protect Core Web Vitals.

The typography plugin override enforces these defaults inside Markdown content blocks, giving lists, block quotes, tables,
and code samples predictable spacing, underlines, and figure captions.

## Spacing, radii, and elevation

- `spacingTokens` follow a 4px grid with editorial leaps (16 → 24 → 32 → 40 → 48) to balance calm breathing room with
  mobile efficiency. Utilities such as `gap-space-lg` read semantically in JSX.
- `radiiTokens` introduce an `xs` rounding for inputs, `xl/2xl` for hero shells, and `pill`/`round` aliases for buttons,
  chips, and avatar crops.
- `shadowTokens` intentionally avoid harsh drop shadows—`hairline` defines borders, while `floating` creates depth for
  overlays without sacrificing softness.

## Motion, breakpoints, and layering

- `transitionDurations` + `easingTokens` create approachable motion defaults (120–320ms) that respect reduced-motion
  preferences and keep hover/press feedback gentle.
- `breakpoints` define a mobile-first grid (`xs` 320px → `2xl` 1536px) shared between Tailwind and CSS custom properties so
  layout primitives (`Container`, `Section`) stay consistent.
- `zIndexTokens` document stacking order for nav, toasts, modals, and skip links, avoiding magic numbers across the codebase.

## Implementation workflow

1. Update the JSON tokens to document any additions.
2. Mirror values in the TypeScript maps so Tailwind + runtime components stay in sync.
3. Extend `app/globals.css` if a new CSS variable is required (e.g., for legacy modules).
4. Document component usage inside the [style guide](/style) to keep designers, writers, and engineers aligned.

The token layer now covers color, typography, spacing, motion, breakpoints, and z-index, supporting future commerce
extensions without requiring a redesign.
