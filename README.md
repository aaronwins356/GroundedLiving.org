# Grounded Living

Grounded Living is a production-grade, Contentful-powered publishing system built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The experience blends a calm, intentional aesthetic with serious technical foundations—ready for SEO, monetization, and rapid editorial workflows.

## ✨ Platform Highlights

- **Headless by design** – Typed Contentful client (`lib/contentful.ts`) exposes helpers such as `getBlogPosts`, `getBlogPostBySlug`, `getCategories`, `getPages`, and `getAuthors` with ISR and webhook-driven cache busting.
- **App Router architecture** – Uses the Next.js App Router with streaming metadata, edge OG image generation, and layouts optimized for Vercel.
- **Polished design system** – Gradient backgrounds, sticky nav, hero carousel, drop-cap prose styling, Prism-powered code snippets, and responsive imagery tuned for editorial storytelling.
- **Growth ready** – Next SEO defaults, GA4 integration, JSON-LD, newsletter capture, affiliate disclosures, sponsor modules, and a scaffolded Stripe checkout page make monetization turnkey.
- **Testing & quality** – Jest unit tests for data helpers, Cypress e2e scaffolding, and lint/typecheck scripts ensure regressions are caught before deploys.

## 🧱 Contentful Content Models

Create these models with the fields below (all fields non-localized unless noted):

### BlogPost
- `title` (Short text)
- `slug` (Short text, unique)
- `excerpt` (Long text)
- `content` (Rich text)
- `coverImage` (Asset)
- `author` (Reference → Author)
- `category` (Reference → Category)
- `tags` (Array of short text)
- `datePublished` (Date & time)
- `seoDescription` (Short text)
- `affiliate` (Boolean)

### Category
- `name` (Short text)
- `slug` (Short text, unique)
- `description` (Long text)

### Page
- `title` (Short text)
- `slug` (Short text, unique)
- `content` (Rich text)
- `heroImage` (Asset, optional)
- `seoDescription` (Short text)

### Author
- `name` (Short text)
- `bio` (Long text)
- `avatarImage` (Asset)

> 💡 Tip: Configure Contentful webhooks to POST to `/api/revalidate?secret=<SECRET>` so publishing or updating entries revalidates the correct pages instantly.

## 🔧 Environment Variables

Copy `.env.local.example` → `.env.local` and populate:

```
CONTENTFUL_SPACE_ID=3xlrzd32ll73
CONTENTFUL_DELIVERY_TOKEN=-wvyXNxFPwtx3haCVkdFrCUcyG41-4MqXYw0Xo4pgas
CONTENTFUL_PREVIEW_TOKEN=lukdbkF9dZ-eJzyYISC8DomoEKL27ldgWF3T6ffgJa4
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_REVALIDATE_SECRET=<random-long-string>
CONTENTFUL_REVALIDATE_INTERVAL=120
NEXT_PUBLIC_SITE_URL=https://www.groundedliving.org
NEXT_PUBLIC_GA_TRACKING_ID=<ga4-id>
NEXT_PUBLIC_NEWSLETTER_ENDPOINT=<mailchimp-or-convertkit-endpoint>
NEXT_PUBLIC_NEWSLETTER_PROVIDER=ConvertKit
```

On Vercel, add the same variables (Environment Variables → Production/Preview) and wire the Contentful webhook to the Vercel deploy hook or `/api/revalidate` endpoint.

## 🚀 Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run dev server**
   ```bash
   npm run dev
   ```
3. **Lint, typecheck, and tests**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```

## 🧭 Editorial Workflow

1. Draft or update entries inside Contentful.
2. Publish the entry → Contentful webhook calls `/api/revalidate`.
3. Tagged cache entries are invalidated and Vercel rebuilds the affected ISR pages.
4. `app/blog`, `app/blog/[slug]`, `app/pages/[slug]`, `app/categories/[slug]`, and the home page pick up the new content automatically.

## 🧱 Site Structure

- `/` – Hero carousel, category ribbons, latest stories, and newsletter CTA.
- `/blog` – Featured carousel, category chips, pagination, newsletter CTA.
- `/blog/[slug]` – Hero image, author/date, affiliate disclaimer, Prism-highlighted prose, share buttons, structured data, related posts, sponsor block, newsletter signup.
- `/pages/[slug]` – Generic marketing or evergreen pages sourced from Contentful Page entries.
- `/categories` & `/categories/[slug]` – Category index and intention-specific hubs.
- `/products/checkout` – Stripe-ready checkout scaffold with implementation notes.
- `/sitemap.xml` & `/robots.txt` – Generated with Contentful slugs for SEO.
- `/api/og` – Vercel OG image generator for dynamic sharing images.
- `/api/revalidate` – Webhook endpoint for on-demand ISR.

## 🛠️ Testing & Tooling

- **Unit tests** – `npm run test` executes Jest tests in `__tests__/` (ts-jest ESM preset).
- **E2E scaffolding** – Cypress config + example specs (`cypress/e2e`) for homepage, blog index, and detail routes.
- **Static analysis** – `npm run lint` (Next core web vitals) and `npm run typecheck` (strict TypeScript).

## 🌐 Deployment Checklist

1. Connect the repository to Vercel (custom domain `groundedliving.org` recommended).
2. Add environment variables in Vercel (Project Settings → Environment Variables).
3. Configure a Vercel Deploy Hook and place the URL in a Contentful webhook for instant rebuilds.
4. Enable HTTPS (automatic on Vercel) and point DNS to Vercel if using the custom domain.
5. Monitor GA4 (via `NEXT_PUBLIC_GA_TRACKING_ID`) and Vercel Analytics for performance insights.

## 📄 Monetization Hooks

- Newsletter signup integrates with Mailchimp/ConvertKit via `NEXT_PUBLIC_NEWSLETTER_ENDPOINT`.
- `affiliate` flag on BlogPost entries adds disclosure + CTA styling.
- Sponsor spotlight blocks live on post detail pages—update via Contentful copy.
- Stripe checkout scaffold (`/products/checkout`) documents how to wire sessions when ready.

## 🧰 Maintenance Notes

- Tailwind tokens live in `tailwind.config.ts`. Gradients, shadows, and typography utilities are centralized for consistency.
- Ambient types belong in `global.d.ts` if you introduce packages without TypeScript definitions.
- To extend OG images, tweak `app/api/og/route.tsx` for additional props (e.g., background images, author avatars).

Grounded Living is engineered to scale from first post to six-figure media business—while staying soft, soulful, and intentional. 🌿
