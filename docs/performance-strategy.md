# Grounded Living Performance Optimization Strategy

## Overview

This document outlines the performance engineering roadmap for Grounded Living with a focus on Core Web Vitals (CWV) on mobile devices. The plan translates business objectives into technical workstreams and prioritizes changes that will deliver measurable improvements in Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Interaction to Next Paint (INP).

Key targets:
- **LCP ≤ 2.0s** (mobile, p75).
- **CLS ≤ 0.05** (mobile, p75).
- **INP ≤ 200ms** (mobile, p75).
- **≥35% reduction** in transferred bytes relative to baseline.
- **≥50% reduction** in image transfer size relative to baseline.

## 1. Baseline & Instrumentation

### Lab Audits (Week 1)
1. Run Lighthouse (mobile + desktop) for the homepage, category, article, recipe, and search templates. Store JSON/HTML reports in `docs/perf-audits/`.
2. Use WebPageTest (mobile profile, 4G throttling) to capture waterfalls, visual progress, and filmstrips. Record LCP element, blocking scripts, and layout shifts.
3. Capture bundle composition using `next build --analyze` (Webpack Bundle Analyzer) to quantify JS/CSS payloads per route.

### Field Data (Week 1–2)
1. Enable the Chrome User Experience Report (CrUX) via Search Console if available for production domains.
2. Add a lightweight Real User Monitoring (RUM) snippet (e.g., `@vercel/analytics` or SpeedCurve LUX) to record CWV for real sessions. Ensure data is anonymized and respects privacy policies.
3. Ship a weekly automated report summarizing lab + field CWV trends.

### Asset Inventory (Week 1)
1. Enumerate existing images under `public/` and `content/` using a script (see Appendix A). Capture format, dimensions, and file size.
2. Inventory all third-party scripts (analytics, ads, embeds) and note loading strategy (sync/defer/async/lazy).

## 2. Media Pipeline Overhaul (Weeks 2–4)

### Format & Delivery
- Convert all photographic assets to **AVIF** with WebP fallback using a build script (e.g., `sharp`). Store source masters in `groundedliving/media-source/` and generated assets in `public/media/`.
- Replace static `img` tags with Next.js `<Image>` components to leverage automatic resizing, AVIF/WebP negotiation, and lazy loading. Explicitly set `priority` only for LCP images.

### Responsive Variants
- Generate widths: 400, 800, 1200, 1600 (hero) and update Markdown MDX image renderer to emit `sizes` attributes based on viewport breakpoints.
- For recipe galleries, implement a data-driven configuration to cap maximum served width on mobile at 800px.

### Placeholders & Dimensions
- Ensure every image has `width`/`height` metadata stored in frontmatter or derived at build time to prevent CLS.
- Generate low-quality image placeholders (LQIP) or blurred placeholders via `plaiceholder` during static generation.

### Governance
- Add a CI check that fails if an imported image exceeds 200KB optimized size or lacks dimensions metadata.

## 3. CSS & JavaScript Budget (Weeks 5–6)

### CSS
- Enable Tailwind JIT purge with production safelist and audit custom CSS. Target ≤50KB gzipped CSS per route.
- Extract critical CSS for the above-the-fold sections of article and recipe pages using `@next/next/no-css-tags` lint rules and optional tooling like `critters`.

### JavaScript
- Enforce a **180KB gzipped** budget per route via custom ESLint rule or `bundlesize` script in CI.
- Split shared layouts and template-specific code using the App Router’s nested layout support.
- Defer non-critical scripts (analytics, share widgets) with `next/script` `strategy="afterInteractive"` or `lazyOnload`.
- Replace heavyweight dependencies (e.g., Moment.js) with lighter alternatives (e.g., `date-fns`). Use dynamic imports for editor-only or admin components.
- Audit and remove unused React state/hydration by preferring static Markdown rendering and progressive enhancement for interactive modules.

## 4. Font Optimization (Week 7)

- Limit to two families (e.g., Inter + Fraunces) and maximum three weights.
- Self-host WOFF2 subsets in `public/fonts/` and preload critical files via `<link rel="preload" as="font" crossorigin>` in the root layout.
- Set `font-display: swap` and ensure fallback stacks are metrics-compatible to avoid CLS.
- Measure layout shift during font swap using Web Vitals overlay.

## 5. Rendering Path & Prefetching (Week 7–8)

- Preload the hero (LCP) image via `<link rel="preload">` in `app/layout.tsx` using `ImageResponse` metadata.
- Use `next/link` `prefetch` for in-viewport links and implement `router.prefetch` on idle for related articles.
- Ensure API data fetching leverages static generation (`generateStaticParams`, `revalidate`) to deliver HTML-first responses with minimal client JS.

## 6. Layout Stability Controls (Continuous)

- Reserve space for ads and embeds using CSS aspect-ratio boxes and placeholder divs.
- Refactor sticky elements to avoid pushing content once rendered; prefer transforms rather than position adjustments.
- Validate CLS with Lighthouse trace analysis and Chrome DevTools Performance panel.

## 7. Monitoring & Regression Protection (Week 9+)

- Integrate **Lighthouse CI** via GitHub Actions. Block merges when performance <95 on mobile configuration.
- Add `npm run analyze:bundles` (webpack-bundle-analyzer) and `npm run test:web-vitals` (custom script leveraging `lighthouse-ci` or `@axe-core/cli`) to CI.
- Capture historical metrics in a dashboard (Looker Studio, SpeedCurve, or Data Studio) pulling from RUM and Lighthouse artifacts.
- Configure alerts (Slack/email) when field CWV drops below “Good”.

## 8. Execution Timeline

| Week | Focus | Key Deliverables |
| --- | --- | --- |
| 1 | Baseline | Lighthouse/WebPageTest reports, asset inventory, bundle analysis |
| 2 | Instrumentation | RUM snippet live, weekly CWV report automation |
| 2–4 | Media | AVIF pipeline, responsive image components, LQIPs, CI guardrails |
| 5–6 | CSS/JS | Purged CSS, code splitting, bundle budget enforcement |
| 7 | Fonts | Preloaded/self-hosted fonts, fallback review |
| 7–8 | Rendering | Preloaded LCP assets, prefetch strategy, static HTML-first refactors |
| 9+ | Monitoring | Lighthouse CI, dashboards, alerting |

## 9. Acceptance Criteria

- Mobile Lighthouse Performance ≥95 for article and recipe templates in CI.
- LCP ≤2.0s, CLS ≤0.05, INP ≤200ms at p75 in field data.
- ≥35% reduction in total transferred bytes and ≥50% reduction in image bytes compared to baseline reports.
- Zero regressions in Accessibility or SEO audits.

## Appendix A – Asset Inventory Script (Example)

```bash
node scripts/inventory-images.mjs > docs/perf-audits/image-inventory.json
```

Example script outline:
```javascript
import { promises as fs } from "fs";
import path from "path";
import imageSize from "image-size";

const ROOT = path.join(process.cwd(), "public");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      if (/\.(png|jpe?g|webp|avif)$/i.test(entry.name)) {
        const buffer = await fs.readFile(fullPath);
        const { width, height, type } = imageSize(buffer);
        return {
          path: path.relative(ROOT, fullPath),
          bytes: buffer.byteLength,
          width,
          height,
          format: type,
        };
      }
      return null;
    })
  );
}

const flatten = (arr) => arr.flatMap((item) => (Array.isArray(item) ? flatten(item) : item)).filter(Boolean);

const main = async () => {
  const images = flatten(await walk(ROOT));
  await fs.mkdir(path.join(process.cwd(), "docs/perf-audits"), { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), "docs/perf-audits/image-inventory.json"),
    JSON.stringify(images, null, 2)
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

This script inventories image metadata to guide conversion priorities and ensures dimension data is available for rendering.

