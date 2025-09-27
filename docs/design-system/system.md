# Grounded Living design system

This document packages the production-ready, mobile-first design system for Grounded Living. It includes the initial audit,
brand foundations, component inventory, editorial templates, and implementation guardrails required to ship confidently in
Next.js/Tailwind.

## 1. Audit highlights

| Area | Finding | Recommendation |
| --- | --- | --- |
| Navigation | Header lacked scroll awareness and mobile tap targets < 44px | Introduced sticky, auto-hiding nav with 52px tappable rows and overlay menu |
| Typography | Body copy occasionally dropped to 15px with 1.4 line-height | Locked base to clamp(1rem→1.125rem) with 1.7 line-height and max 68ch measure |
| Spacing | Dense vertical rhythm in recipe steps (≤12px) | Adopted 4px grid with 24–32px section spacing for calm breathing room |
| CTAs | Newsletter form visually heavy inside articles | Added card, inline, and ribbon variants tied to saffron accent and easy dismissal |
| Related content | Inconsistent card ratios & image cropping | Standardized cards to 3:2 aspect, image-object-cover, consistent meta stack |

> _Note:_ Screenshots were reviewed in local development (1440 / 1024 / 375 breakpoints). Capture commands live in
> `docs/design-system/qa-checklist.md` for reproducibility.

## 2. Brand & token foundations

- **Palette.** Stone neutrals (0–950) paired with moss/fern greens, clay warmth, and saffron CTA energy. Semantic success,
  info, warning, and danger ramps maintain AA+ contrast.
- **Type pairing.** Fraunces (display) + Inter (body) with weights regular → bold only. Clamp scale ensures editorial
  hierarchy without payload bloat.
- **Spacing + geometry.** 4px grid with semantic names (`space-sm`, `space-3xl`), pill/round radii for CTAs and chips, and
  soft elevation tokens (`shadow-hairline`, `shadow-floating`).
- **Motion.** 120–320ms durations, standard/entrance/exit/elevated easings, and motion-distance tokens for micro-animations.
- **Breakpoints.** xs 320 → 2xl 1536, mirrored between Tailwind and CSS variables for container + grid utilities.

Full token listings live in [`tokens.md`](./tokens.md) and the source maps:

- [`lib/design/tokens.ts`](../../lib/design/tokens.ts)
- [`lib/design/tokens.json`](../../lib/design/tokens.json)
- [`app/globals.css`](../../app/globals.css)
- [`tailwind.config.ts`](../../tailwind.config.ts)

## 3. Core components

| Component | Location | Status | Notes |
| --- | --- | --- | --- |
| Header (NavBar) | `components/site/Header.tsx` | Ready | Sticky panel, mobile overlay, search modal, auto-hide on scroll |
| Footer | `components/site/Footer.tsx` | Ready | Multi-column sitemap, newsletter CTA, social links |
| Post card | `components/blog/PostCard.tsx` | Ready | 3:2 media ratio, excerpt, accessible metadata |
| Breadcrumbs | `components/nav/Breadcrumbs.tsx` | Ready | Ordered list, collapses on small screens |
| Newsletter form | `components/ui/NewsletterForm.tsx` | Ready | Inline + stacked variants, focus management, analytics tracking |
| Buttons | `components/ui/Button.tsx` | Ready | Primary, secondary, ghost variants with focus states |
| Callout | `components/ui/Callout.tsx` | Ready | Clay/moss gradient background for editorial highlights |
| Style guide | `/app/(site)/style/page.tsx` | Ready | Live tokens, typography, spacing, CTA snapshots |
| Recipe layout modules | `app/(site)/blog/[slug]/page.tsx` | In use | Schema-driven ingredients, steps, nutrition blocks |
| Upcoming: PullQuote | Spec | Planned | Clay-backed quote block with saffron accent; implement in rich text renderer |
| Upcoming: Figure + lightbox | Spec | Planned | 4:3 enforced aspect with focus-trapped modal |
| Upcoming: Related posts module | Spec | Planned | 3-up responsive row leveraging `PostCard` |
| Upcoming: Pagination | Spec | Planned | Previous/next CTA with numeric indicators |

Component props, states, and wiring live in `components/` (React + Tailwind). Each component has Storybook-ready examples in
`docs/design-system/style-guide.mdx` (in progress) and the live `/style` page.

## 4. Editorial page kits

1. **Home.** Hero story with featured recipes, latest wellness, and evergreen guides. Uses alternating background panels and
   inline CTA.
2. **Category index.** Grid/list toggle, filters by tags or dietary preferences, persistent subscribe ribbon.
3. **Article layout.** Title → dek → meta → hero (16:9) → TOC (if >6 headings) → content modules (pull quotes, callouts, inline CTA
   at 40% depth) → related posts → comments.
4. **Recipe layout.** Jump links (Intro, Ingredients, Steps, Notes, Nutrition, Print). Schema-driven summary block sticks on
   desktop viewport, collapses to accordion on mobile.
5. **Search results.** Keyword highlight, filters for content type, infinite scroll fallback to pagination.
6. **Author page.** Hero portrait, bio, expertise chips, follow CTAs, latest posts.
7. **404 / Empty states.** Soft saffron illustration, search box, curated suggestions.

Wireframes and layout tokens are documented on the `/style` page and cross-referenced in component comments for developers.

## 5. Conversion patterns

- **Newsletter CTA.** Inline card after the third paragraph, end-of-post panel with moss background, and footer ribbon triggered
  by scroll depth. All variants include visible close buttons, double opt-in copy, and `aria-live` feedback.
- **Related content.** 3-up responsive cards using `Card` component, curated by category and reading history (future ML slot).
- **Product readiness.** Card + list layouts accommodate product imagery, price badges, and quick-add buttons without changing
  the system tokens.

## 6. Asset pack

Assets ship as vector/SVG to keep payload small:

- [`public/brand/wordmark.svg`](../../public/brand/wordmark.svg)
- [`public/brand/favicon.svg`](../../public/brand/favicon.svg)
- [`public/brand/og-template-base.svg`](../../public/brand/og-template-base.svg)
- [`public/brand/social-banner-template.svg`](../../public/brand/social-banner-template.svg)

Each template includes editable title/subtitle layers and safe margins (see SVG comments).

## 7. Implementation handoff

- **Tailwind mapping.** Tokens wired in [`tailwind.config.ts`](../../tailwind.config.ts); `theme.extend` exposes
  `text-moss-500`, `bg-surface-panel`, `shadow-floating`, `z-header`, etc.
- **Props contracts.** Each component exports TypeScript props with explicit interfaces and JSDoc comments. Required fields
  (e.g., `Card.image.alt`) enforce accessibility at compile time.
- **Accessibility.** Focus states use saffron focus shadow, nav overlay traps focus, skip link is visible on focus, and TOC +
  breadcrumbs use semantic lists. Color choices exceed WCAG 2.1 AA.
- **QA checklist.** Automated + manual checklist lives in [`qa-checklist.md`](./qa-checklist.md) including Lighthouse, Axe,
  tab order, responsive screenshots, and regression commands.

## 8. Next steps

- Build Storybook stories for each component variant (tokens already ready for add-on integration).
- Add optional dark theme by swapping CSS custom properties via `data-theme="dark"` toggle.
- Monitor newsletter CTR (target ≥1.5%) and related-post CTR (≥5%) with existing analytics hooks; iterate if below target.

This system is ready for production implementation and future commerce expansion without sacrificing clarity or calm.
