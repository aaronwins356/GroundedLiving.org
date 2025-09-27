# Grounded Living SEO Playbook

This playbook documents the conventions that keep Grounded Living discoverable, indexable, and eligible for rich results. Share it with anyone shipping content or code.

## Titles & Meta Descriptions
- Every route must declare a `Metadata` object. Use `buildMetaTitle` for titles so that the "Grounded Living" brand suffix and 60-character length limit are enforced.
- Keep meta descriptions between 150–155 characters using `truncateAtBoundary`. Pull from editorial copy first, then fall back to defaults in `seoConfig`.
- Always provide a canonical URL via `alternates.canonical`.

## Headings & Structure
- Exactly one `<h1>` per page. Use `<h2>` for major sections and `<h3>` for supporting subsections.
- Blog posts auto-generate anchor IDs for `<h2>`/`<h3>` elements and display a table of contents when three or more headings are present.
- Decorative headings should be replaced with styled `<div>` elements.

## Breadcrumbs & Internal Navigation
- All indexable templates render visible breadcrumbs with schema markup via the `Breadcrumbs` component and `breadcrumbList` helper.
- Blog posts must render the `TableOfContents` block and `related-posts` section to surface additional internal links.
- Content editors should include at least three contextual internal links inside the body copy. The `autoLinkHtml` utility will supplement when possible.

## Structured Data
- Blog posts emit `BlogPosting` JSON-LD via `buildArticleJsonLd`. Pass the canonical URL, meta headline, author, and publish dates.
- Recipe posts automatically include a `Recipe` JSON-LD block with ingredients, instructions (`HowToStep`), durations, yield, and optional nutrition data.
- Product detail pages ship `Product` structured data and link directly to the checkout URL.

## Indexing & Canonicalization
- `canonicalFor` normalizes every URL against `siteUrl`. Use it whenever you need an absolute link.
- `robots.txt`, `sitemap.xml`, and per-route canonical tags are generated from the App Router. Submit the sitemap to Search Console after each major launch.
- Ensure all deployments 301 to the primary domain (`groundedliving.org`).

## Images & Media
- Always provide descriptive `alt` text. The SEO utilities will fall back to the title when contentful fields are empty.
- Specify `width`/`height` on `<Image>` components to stabilize layout and reduce CLS.
- Name asset files descriptively before uploading (e.g., `golden-milk-latte.jpg`).

## Quality Assurance
- Run `npm run lint`, `npm run build`, and `tsc --noEmit` before merging.
- Validate blog and recipe templates with Google’s Rich Results Test when new fields are introduced.
- Target a Lighthouse SEO score ≥95 for all content templates.

Following these practices keeps the experience crawlable and conversion-friendly as the library grows.
