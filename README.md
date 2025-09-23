# Grounded Living

Grounded Living is an elegant, editorial-quality Next.js 14 blog experience inspired by the soft, healing palette of [Healing Soulfully](https://healingsoulfully.com) and the polished content structure of [My TX Kitchen](https://www.mytxkitchen.com/easy-homemade-brownies/). Content is managed in Contentful and served statically by Vercel with automatic ISR revalidation, so non-technical editors can publish stories without touching code.

## ✨ Features

- **App Router + TypeScript** – Built on Next.js 14 with server components, streaming metadata, and typed Contentful helpers.
- **Contentful-first workflow** – Typed models for posts, categories, and pages with reusable fetching utilities (`getPosts`, `getPostBySlug`, `getPageSummaries`, etc.).
- **On-demand revalidation** – `/api/revalidate` endpoint accepts Contentful webhook payloads to refresh cached routes instantly.
- **Healing Soulfully aesthetic** – Tailwind-powered theme with creamy neutrals, muted sages, dusty pinks, and refined typography (Playfair Display + Lato).
- **Immersive homepage** – Hero carousel for featured stories, “Browse by Intention” category chips, and a hover-rich latest posts grid using blur-up `next/image` placeholders.
- **Polished article pages** – Full-width banner, centered metadata, Tailwind Typography prose, accessible image styling, share buttons, and a related stories/affiliate sidebar.
- **Navigation & footer** – Sticky, glassmorphism-inspired top bar with responsive menu + Contentful pages, and a minimal footer with socials.
- **Deployment ready** – Works with `npm run build`, `npm run lint`, and `npm run typecheck`. Vercel auto-detects the Next.js app and deploys on push.

## 🧱 Contentful Models

Create the following content models in Contentful (all fields “localized” disabled unless needed):

### Post
- `title` – Text (short)
- `slug` – Text (short, unique)
- `coverImage` – Media (asset)
- `category` – Reference (one entry, Category)
- `excerpt` – Text (long)
- `body` – Rich text
- `date` – Date & time

### Category
- `name` – Text (short)
- `slug` – Text (short, unique)

### Page
- `title` – Text (short)
- `slug` – Text (short, unique)
- `content` – Rich text

> ℹ️ Optional: add a boolean “Featured” field to Post entries if you want to manually curate the hero carousel. The UI gracefully falls back to the latest posts when unset.

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables** – Duplicate `.env.local.example` and rename it to `.env.local`, then fill in the values from your Contentful space:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Create Contentful webhook** – Point a webhook to `https://<your-vercel-domain>/api/revalidate` with the secret from `CONTENTFUL_REVALIDATE_SECRET`. Include the entry ID, slug, and content type in the body (default Contentful payload works) so published/updated content instantly refreshes on the site.

## 📦 Available Scripts

- `npm run dev` – Start the Next.js dev server.
- `npm run build` – Create an optimized production build.
- `npm run start` – Run the production server locally.
- `npm run lint` – Lint with `next/core-web-vitals` rules.
- `npm run typecheck` – Validate TypeScript types with `tsc --noEmit`.

## 🧭 Content Editing Workflow

1. Log in to Contentful and open the **Grounded Living** space.
2. Create a new **Post**, attach a cover image (add alt text!), choose a Category, write your rich text body, and publish.
3. Optional: create or edit **Page** entries for About, Contact, or custom landing pages.
4. Contentful fires the webhook → `/api/revalidate` → relevant routes (`/`, `/journal`, `/posts/[slug]`, `/categories/[slug]`, `/pages/[slug]`) are revalidated automatically.

The navigation surfaces any Pages you publish, and the homepage carousel + grid update automatically from the latest entries.

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. Connect the repo to Vercel – it auto-detects Next.js and installs dependencies.
3. Add the environment variables from `.env.local` in the Vercel dashboard (Project Settings → Environment Variables).
4. Trigger a build; your preview URL will update in a few minutes.
5. Configure the Contentful webhook to hit the production `/api/revalidate` endpoint for instant cache busting after editors publish.

## 🛠️ Additional Notes

- Remote images are served from `images.ctfassets.net` and `assets.ctfassets.net`; update `next.config.js` if you use a custom CDN.
- If you add third-party packages without TypeScript definitions, declare ambient types in `global.d.ts` (per project conventions).
- Tailwind tokens live in `tailwind.config.ts`, with custom animations, shadows, and gradients to mimic Healing Soulfully’s aesthetic.
- The design intentionally avoids hardcoded copy so you can customize the tone within Contentful entries.

Welcome to a calmer, softer web publishing flow. 🌿
