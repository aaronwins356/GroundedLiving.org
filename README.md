# Grounded Living

Grounded Living is a Next.js 15 wellness publication engineered for high-growth content marketing. It pairs a composable
Contentful CMS, modern SEO automation, and monetization-ready UI primitives so new stories can ship in minutes and rank fast.

## Tech stack

- **Framework:** Next.js 15 App Router with React Server Components
- **Styling:** Tailwind-inspired utility system using CSS variables and editorial typography
- **CMS:** Contentful GraphQL Content API (Blog posts, Pages, Categories, Authors)
- **Analytics:** Google Analytics 4 and Vercel Speed Insights
- **Deployment:** Vercel with ISR + webhook-triggered cache revalidation

## Design system foundation

The design tokens and primitives established in this iteration provide a consistent visual rhythm across future templates.

- **Color tokens:**
  - `ink` (`#0F172A`) – primary text and iconography
  - `bone` (`#F8F5F2`) – global page background
  - `moss` (`#5B7F6B`) – primary accent and interactive states
  - `clay` (`#C8A98E`) – secondary accent and surface treatments
  - `saffron` (`#D9A441`) – highlight color for focus states and badges
- **Border radii:** default `0.75rem` with `xl` (`1rem`) and `2xl` (`1.25rem`) options surfaced via the `--radius-*` CSS variables.
- **Typography:** Fraunces drives headlines (`--font-display`) while Inter anchors body copy (`--font-body`). Both fonts are self-hosted via `next/font` with `font-display: swap`.
- **UI primitives:**
  - `Container` handles responsive width constraints and page padding.
  - `Section` applies vertical spacing for page sections.
  - `Button` includes `primary`, `secondary`, and `ghost` variants with accessible focus rings.
  - `Callout` provides a soft-highlight panel for tips or disclosures.
  - `NewsletterForm` ships a form shell ready for ESP integration and shares button/input styling.
  - `ArticleShell` wraps long-form content inside `.prose` typography styles for blog posts and documentation pages.

Use the sandbox route at `/sandbox/typography` to preview the typography scale, blockquotes, code blocks, and interaction states as new components roll out.

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
   CONTENTFUL_SPACE_ID=xxx
   CONTENTFUL_ENVIRONMENT=master
   CONTENTFUL_DELIVERY_TOKEN=xxx
   CONTENTFUL_PREVIEW_TOKEN=xxx
   CONTENTFUL_MANAGEMENT_TOKEN=xxx
   CONTENTFUL_REVALIDATE_SECRET=choose-a-strong-secret
   NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
   NEXT_PUBLIC_GSC_VERIFICATION=google-site-verification-token
   NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_NEWSLETTER_ACTION=https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions
   NEXT_PUBLIC_STRIPE_CHECKOUT_URL=https://buy.stripe.com/YOUR_TEST_CHECKOUT
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
| `npm run migrate:posts` | One-off migration of Markdown/legacy JSX posts into Contentful. |

> Always run `npm run lint && npm run build` before committing to mirror CI.

> **Offline builds:** When running in an environment without outbound network access (CI runners, airplanes, etc.), export
> `NEXT_DISABLE_FONT_DOWNLOADS=1` so the layout sticks to system font stacks and `npm run build` succeeds without reaching
> Google Fonts.

### SEO & discovery tooling

- **Canonical base:** All absolute URLs and metadata derive from `NEXT_PUBLIC_SITE_URL`, so keep it in sync with your active
  Vercel domain.
- **Verification:** Drop your Google Search Console HTML token into `NEXT_PUBLIC_GSC_VERIFICATION` to emit the required
  `<meta name="google-site-verification" ...>` tag globally.
- **Discovery endpoints:**
  - `/robots.txt` – standard crawl directives
  - `/sitemap.xml` – canonical URLs for home, trust pages, journal, categories, and posts
  - `/feed.xml` – RSS 2.0 feed for recent stories
  - `/og` – dynamic Open Graph image template that accepts `title`, `subtitle`, and `type`

### Editorial SEO checklist

- Provide a unique `SEO Title` and `SEO Description` in Contentful. The description should stay under ~155 characters so it
  fits SERP snippets.
- Attach an `ogImage` asset for premium visuals. When omitted, the platform auto-generates a branded card via `/og`.
- Use the rich text editor’s excerpt field for a clear summary; the app falls back to it for metadata and RSS descriptions.
- Confirm each story routes to the correct category to keep `/categories/<slug>` pages fresh for crawlers.

### GitHub Actions secrets

Populate the following repository secrets under **Settings → Secrets and variables → Actions** so automated workflows can authenticate safely:

| Secret | Purpose |
| --- | --- |
| `CONTENTFUL_SPACE_ID` | Identifies the Contentful space for GraphQL queries and migrations. |
| `CONTENTFUL_ENVIRONMENT` (optional) | Overrides the target environment; defaults to `master` when omitted. |
| `CONTENTFUL_DELIVERY_TOKEN` | Required by the Next.js app at build/runtime to read published entries. |
| `CONTENTFUL_PREVIEW_TOKEN` | Enables preview mode if you wire up draft previews later. |
| `CONTENTFUL_MANAGEMENT_TOKEN` | Grants the migration script permission to create and publish entries. |

Keep the same values in Vercel’s project settings so production builds have identical access.

## 2. Content migration

Run the migration script once to seed Contentful with the Markdown posts under `content/posts`. The tool also inspects the
legacy `/pages/blog/*.tsx` directory so historical JSX posts are preserved. It skips entries whose slugs already exist inside
Contentful, making it safe to rerun if something fails midway.

```bash
# ensure dependencies are installed locally first
npm install

# migrate posts (uses CONTENTFUL_* variables from .env.local)
npm run migrate:posts
```

Each post is created as a `blogPost` entry with populated `title`, `slug`, `excerpt`, `content`, and `datePublished` fields.
The Markdown body is converted to a simple Rich Text document so editors can refine it in the Contentful web app.

If you also have static marketing pages stored locally, recreate them inside Contentful using the Page content model outlined
below so they stay in sync with the new workflow.

## 3. Contentful models

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
- `heroImage` (Asset, optional)

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

## 4. Editorial workflow

1. **Create or edit blog posts** using the **BlogPost** content model. Populate the SEO description, affiliate toggles, and
   optional sponsored metadata so the layout renders disclosures automatically.
2. **Build evergreen marketing pages** such as About or Contact with the **Page** model. The App Router `[slug]` route renders
   any slug you publish.
3. **Maintain global taxonomy** by creating **Category** and **Author** entries. Blog posts reference these records for filters,
   navigation, and author bios.
4. Content editors publish entries directly from Contentful’s web studio. The Next.js site consumes everything from the delivery
   API, so no additional Git commits are needed for content updates.

## 5. Webhooks & revalidation

1. In Contentful go to **Settings → Webhooks** and create a webhook that POSTs to your Vercel deploy hook URL. Trigger it on
   `publish` and `unpublish` events for BlogPost and Page so a fresh deployment is queued whenever long-form content changes.
2. Create a second webhook targeting the incremental cache endpoint exposed by this repo:
   ```
   https://your-vercel-domain/api/revalidate?secret=CONTENTFUL_REVALIDATE_SECRET
   ```
   Trigger it on `publish`, `unpublish`, and `delete` for BlogPost, Page, Category, and Author to warm ISR caches instantly.
3. Contentful editors can optionally call `/api/revalidate` manually with a `tag` payload to refresh individual cache tags when
   testing draft workflows.

## 6. Migration tooling

- **Local script:** `npm run migrate:posts` reads `/content/posts/*.md(x)` and `/pages/blog/*.tsx` files, converts them into Contentful Rich Text, and publishes `blogPost` entries while skipping slugs that already exist.
- **GitHub workflow:** `Migrate legacy posts to Contentful` (see Actions tab) performs the same migration in CI. Trigger it manually after uploading new Markdown files to the repo.
- The script respects `CONTENTFUL_ENVIRONMENT` (defaults to `master`) and populates `title`, `slug`, `excerpt`, `content`, `datePublished`, and `seoDescription` fields so editors can immediately fine-tune entries inside Contentful.

## 7. Monetization & growth hooks

- **Newsletter:** The ConvertKit/Mailchimp form posts to `NEXT_PUBLIC_NEWSLETTER_ACTION` and renders inline + footer modules.
- **Affiliate disclosure:** Toggle the `affiliate` boolean on any post to surface an FTC-compliant notice with configurable CTA.
- **Sponsored stories:** Mark `sponsored` and optionally provide `sponsoredLabel` to badge hero metadata.
- **Digital products:** `/shop` includes a placeholder Stripe checkout button wired to `NEXT_PUBLIC_STRIPE_CHECKOUT_URL`.
- **Analytics:** GA4 loads automatically when `NEXT_PUBLIC_GA_TRACKING_ID` is present.

## 8. Deployment

1. Push to GitHub; Vercel detects the project automatically.
2. Set the environment variables above in the Vercel dashboard (Project Settings → Environment Variables).
3. Add a Contentful webhook pointing to the `/api/revalidate` endpoint so publishes trigger cache busting.
4. Configure a Vercel Deploy Hook if you prefer to trigger full builds after editorial pushes.

## 9. Continuous integration & automation

- **CI pipeline (`.github/workflows/ci.yml`):** runs on every push and pull request with `npm run lint`, `npm run typecheck`, and `npm run build` to mirror production deployments.
- **Migration pipeline (`.github/workflows/migrate.yml`):** can be dispatched manually or on pushes that touch local markdown files to sync Contentful. All secrets are read from GitHub Actions secrets, never from plaintext files.
- Successful builds can deploy automatically through Vercel once its project tokens are configured in the Vercel dashboard.

## 10. Additional notes

- Rich Text rendering is handled by a bespoke renderer that mimics Tailwind Typography so Contentful editors see polished output.
- Hero carousel, category chips, and newsletter modules reuse the same Contentful data so marketing pages stay in sync.
- Image domains are limited to Contentful hosts (`images.ctfassets.net`, `assets.ctfassets.net`, `downloads.ctfassets.net`); add more in `next.config.js` if you host elsewhere.

With this foundation you can deliver high-quality, SEO-friendly content, monetize through affiliates or Stripe products, and
ship updates without touching code.

## 8. Trust Pages & Contact

Grounded Living now ships with evergreen trust content and a private contact flow so readers can reach the team without leaving the site.

- **Managed in Contentful:** Create four `Page` entries with the slugs `about`, `contact`, `privacy`, and `disclosure`. Populate `bodyRichText`, `seoTitle`, `seoDescription`, and optional `ogImage`. The App Router route `app/(site)/[slug]/page.tsx` renders any matching slug with breadcrumbs, WebPage schema, and `.prose` typography.
- **Local fallbacks:** When the Contentful environment variables are missing, the helpers in `lib/cms.ts` read JSON seeds from `content/pages/*.json` and `content/authors/*.json`. Update these files in development to mirror draft copy or to seed preview deployments.
- **Author card:** The About page pulls an Author record via `getAuthorBySlug` and displays it through `components/site/AuthorCard.tsx`. Add social links (`linkedIn`, `instagram`) and a `bioRichText` field in Contentful for each author you want to highlight.
- **Contact form:** `components/site/ContactForm.tsx` posts to `POST /api/contact`. The endpoint performs basic validation, rate-limits to five submissions per minute per IP, logs payloads server-side, and responds with `{ ok: true }` on success. Integrate your preferred email or Slack provider later by replacing the console log.
- **Trust links:** The global footer links directly to `/about`, `/contact`, `/privacy`, and `/disclosure` so every page surfaces the policy content.

> Email delivery is intentionally deferred. Wire up your transactional service of choice in a future iteration by extending `app/api/contact/route.ts`.
