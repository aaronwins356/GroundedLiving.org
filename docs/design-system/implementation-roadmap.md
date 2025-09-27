# Grounded Living Experience Roadmap

This roadmap outlines how the motion, theming, and visual systems will roll out over the next two months. Each phase builds on
the previous to maintain stability while layering in richer interaction patterns.

## Phase 1 · Motion & Micro-interactions (Weeks 1–2)

- Ship foundational motion primitives (`Reveal`, `PageTransition`) and wire them through hero, shop, and recipe surfaces.
- Enhance interactive elements (buttons, cards, nav links) with transform/opacity-based hover and focus states tuned for
  high-performance rendering.
- Establish animation guardrails, respecting `prefers-reduced-motion` while precomputing transform layers for smoothness.

## Phase 2 · Dark Mode & Theme Tokens (Weeks 3–4)

- Expand CSS custom properties to cover typography, surfaces, and component tokens for both light and dark palettes.
- Introduce the header theme toggle with persistence and hydration-safe defaults.
- Audit contrast against WCAG AA+ targets and document component-level guidance for future features.

## Phase 3 · Advanced Visual Assets (Weeks 5–6)

- Produce reusable OG templates via the edge image renderer, covering editorial and commerce variants.
- Add infographic modules that Contentful editors can drop into long-form posts, complete with share-ready typography and print
  treatments.
- Establish recipe share cards that align with the broader brand system and export cleanly for print or PDF.

## Phase 4 · Mobile QA & Low-end Optimization (Weeks 7–8)

- Perform device lab passes focused on low-end Android with throttled 3G to validate LCP < 2s and CLS < 0.05 targets.
- Lazy-load non-critical media, reserve CTA slots, and prefetch top-of-fold assets (fonts, hero imagery).
- Conduct accessibility spot checks for keyboard flow, focus rings, live regions, and announcement timing.

### Ongoing Safeguards

- Monitor Web Vitals via Vercel Speed Insights and surface regressions in weekly design-engineering syncs.
- Keep interaction specs in sync with the design system so future commerce modules inherit the same motion and theming tokens.
