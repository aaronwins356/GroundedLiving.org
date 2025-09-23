# Grounded Living

Grounded Living is a Next.js 15 wellness publication engineered for high-growth content marketing. It pairs a composable
Contentful CMS, modern SEO automation, and monetization-ready UI primitives so new stories can ship in minutes and rank fast.

## Tech stack

- **Framework:** Next.js 15 App Router with React Server Components
- **Styling:** Tailwind-inspired utility system using CSS variables and editorial typography
- **CMS:** Contentful GraphQL Content API (Blog posts, Pages, Categories, Authors)
- **Analytics:** Google Analytics 4 and Vercel Speed Insights
- **Deployment:** Vercel with ISR + webhook-triggered cache revalidation

## 1. Local development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create an environment file**
   ```bash
   cp .env.local.example .env.local
   ```
3. **Fill in the variables**
   ```dotenv
   CONTENTFUL_SPACE_ID=3xlrzd32ll73
   CONTENTFUL_DELIVERY_TOKEN=-wvyXNxFPwtx3haCVkdFrCUcyG41-4MqXYw0Xo4pgas
   CONTENTFUL_PREVIEW_TOKEN=lukdbkF9dZ-eJzyYISC8DomoEKL27ldgWF3T6ffgJa4
   CONTENTFUL_REVALIDATE_SECRET=choose-a-random-string
   NEXT_PUBLIC_SITE_URL=https://www.groundedliving.org
   NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXX
   NEXT_PUBLIC_NEWSLETTER_ACTION=https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions
   NEXT_PUBLIC_STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_checkout_placeholder
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

- [http://localhost:3000](http://localhost:3000) – marketing site and blog
- Incremental Static Regeneration is enabled, so edits in Contentful appear after the revalidate window or an incoming webhook.

### Essential scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run lint` | Run ESLint with `next/core-web-vitals`. |
| `npm run build` | Create an optimized production build. |
| `npm run typecheck` | Verify TypeScript types without emitting output. |

> Always run `npm run lint && npm run build` before committing to mirror CI.

## 2. Contentful models

Create the following models in Contentful with the specified fields:

### BlogPost
- `title` (Text)
- `slug` (Short text, unique)
- `excerpt` (Long text)
- `content` (Rich Text)
- `coverImage` (Asset)
- `author` (Reference → Author)
- `category` (Reference → Category)
- `tags` (Array of short text)
- `datePublished` (Date & time)
- `seoDescription` (Long text)
- `affiliate` (Boolean)
- `affiliateCtaText` (Short text)
- `affiliateCtaUrl` (Short text)
- `sponsored` (Boolean)
- `sponsoredLabel` (Short text)

### Category
- `name`
- `slug`
- `description`

### Page
- `title`
- `slug`
- `content` (Rich Text)
- `navigationLabel` (Short text, optional)
- `navigationPriority` (Number, optional)

### Author
- `name`
- `bio`
- `avatarImage`

Seed your first post with:

- **Title:** Common Remedies for a Common Cold
- **Slug:** `common-remedies-cold`
- **Content:**
  ```text
  Rest. Rest. Rest.

  The most underrated, misunderstood thing out there...
  ```
  Paste the full prompt body into the Rich Text editor so drop caps, blockquotes, and embedded media render through the custom
  renderer.

## 3. Webhooks & revalidation

1. In Contentful go to **Settings → Webhooks** and create a new webhook targeting:
   ```
   https://your-vercel-domain/api/revalidate?secret=CONTENTFUL_REVALIDATE_SECRET
   ```
2. Trigger on `publish`, `unpublish`, and `delete` for BlogPost, Page, Category, and Author.
3. The API route revalidates the appropriate cache tags so ISR pages refresh instantly.

## 4. Monetization & growth hooks

- **Newsletter:** The ConvertKit/Mailchimp form posts to `NEXT_PUBLIC_NEWSLETTER_ACTION` and renders inline + footer modules.
- **Affiliate disclosure:** Toggle the `affiliate` boolean on any post to surface an FTC-compliant notice with configurable CTA.
- **Sponsored stories:** Mark `sponsored` and optionally provide `sponsoredLabel` to badge hero metadata.
- **Digital products:** `/shop` includes a placeholder Stripe checkout button wired to `NEXT_PUBLIC_STRIPE_CHECKOUT_URL`.
- **Analytics:** GA4 loads automatically when `NEXT_PUBLIC_GA_TRACKING_ID` is present.

## 5. Deployment

1. Push to GitHub; Vercel detects the project automatically.
2. Set the environment variables above in the Vercel dashboard (Project Settings → Environment Variables).
3. Add a Contentful webhook pointing to the `/api/revalidate` endpoint so publishes trigger cache busting.
4. Configure a Vercel Deploy Hook if you prefer to trigger full builds after editorial pushes.

## 6. Additional notes

- Rich Text rendering is handled by a bespoke renderer that mimics Tailwind Typography so Contentful editors see polished output.
- Hero carousel, category chips, and newsletter modules reuse the same Contentful data so marketing pages stay in sync.
- Image domains are limited to `images.ctfassets.net`; add more in `next.config.js` if you host elsewhere.

With this foundation you can deliver high-quality, SEO-friendly content, monetize through affiliates or Stripe products, and
ship updates without touching code.
