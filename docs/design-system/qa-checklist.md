# QA & accessibility checklist

Use this list before each release to ensure the design system ships consistently across pages.

## Automated

1. `npm run lint`
2. `npm run test` (if available)
3. `tsc --noEmit`
4. `npm run build`
5. Lighthouse CI (article + recipe pages) — target ≥95 Accessibility, ≥90 Performance/Best Practices/SEO
6. Axe-core integration tests on article and recipe templates

## Manual functional

- [ ] Tab through `/` (home), an article, and a recipe page — ensure logical order and visible focus
- [ ] Confirm skip link appears and focuses main content
- [ ] Validate mobile nav overlay traps focus and is dismissible with <kbd>Esc</kbd>
- [ ] Resize viewport (320 → 1440px) — no horizontal scroll, cards maintain 3:2 aspect
- [ ] Test newsletter CTA variants (inline, end-of-post, footer) for accessibility labels and validation
- [ ] Verify related posts module lazy loads images and maintains contrast over photography
- [ ] Check TOC scrollspy accuracy and skip link/heading semantics
- [ ] Print recipe page — ensure dedicated print stylesheet keeps typography legible

## Visual regression

- Capture updated screenshots using Playwright or Cypress: `npm run test:visual`
- Compare against baseline diffs before merging
- Confirm OG image + social banner templates render correct typography and safe margins

## Analytics & conversion (post-deploy)

- Monitor newsletter CTA CTR (goal ≥1.5%) and related posts CTR (goal ≥5%)
- Review bounce rate + scroll depth metrics after launch to ensure readability improvements are working
- Track recipe print clicks and PDF downloads for future enhancements
