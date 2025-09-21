# Grounded Living

Grounded Living is a calming wellness blog built with Next.js 14, Tailwind CSS, and Sanity. This guide covers day-to-day development, how editors publish content, and the deploy process so the site is easy to grow.

## Tech Stack at a Glance

- **Framework:** Next.js 14 (App Router) with React Server Components.
- **Styling:** Tailwind CSS with a soft, wellness-inspired palette.
- **Content:** Sanity headless CMS for posts and pages, accessed over GROQ queries.
- **Deployment:** Vercel for previews and production.

## Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/aaronwins356/GroundedLiving.org.git
   cd GroundedLiving.org
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Copy the environment template**
   ```bash
   cp .env.local.example .env.local
   ```
4. **Fill in `.env.local`**
   ```dotenv
   SANITY_PROJECT_ID=yourProjectId
   SANITY_DATASET=production
   SANITY_API_VERSION=2023-10-01 # optional, defaults to 2023-10-01
   SANITY_READ_TOKEN= # optional, only needed for private datasets
   NEXT_PUBLIC_SANITY_STUDIO_URL=https://yourproject.sanity.studio # optional hosted studio embed
   ```
5. **Start the dev server**
   ```bash
   npm run dev
   ```
6. Visit [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/studio](http://localhost:3000/studio) for the embedded Sanity Studio (if `NEXT_PUBLIC_SANITY_STUDIO_URL` is provided).

> `.env.local` is ignored by Git. Never commit real credentials.

## Daily Development Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode with hot reloading. |
| `npm run lint` | Run ESLint with `next/core-web-vitals`. |
| `npm run build` | Compile a production build and verify type safety. |
| `npx tsc --noEmit` | Standalone type checking (optional when `npm run build` already runs). |

Always run lint and build before opening a PR so CI stays green.

## Sanity Content Workflow

Sanity Studio lives at `/studio`. Editors see two prominent sections:

- **Posts** – Create new articles with title, slug, publish date, excerpt, category, cover image, and rich content blocks.
- **Pages** – Maintain evergreen pages such as About or Contact using the same rich text editor.

Every field includes plain-language descriptions so non-technical editors understand what to enter. Cover images support alt text, and the hero image is optional for pages.

### Publishing Checklist

1. Open `/studio` and select **Posts**.
2. Create a draft, fill out required fields, and upload the cover image (landscape works best).
3. Choose `Publish` or schedule by setting a future `publishedAt` date.
4. The post will automatically appear in the homepage hero carousel and `/blog` listing.

For evergreen content, repeat the process under **Pages**.

## Layout + Monetization Placeholders

- Homepage hero highlights the latest posts with a rotating carousel and a reserved module for future affiliate spotlights.
- Blog post pages include a right-rail card earmarked for curated affiliate resources once partnerships launch.
- The `/shop` route acts as a “coming soon” teaser for future offerings.

These placeholders keep monetization top-of-mind without adding paid features yet.

## Deployments & PR Flow

1. Open a feature branch and commit changes.
2. Push the branch and open a Pull Request targeting `main`.
3. GitHub Actions (or your CI) should run `npm run lint` and `npm run build`.
4. Once the PR is approved, merge to `main`. Vercel auto-deploys `main` to production.
5. Monitor the Vercel deployment dashboard for completion; roll back if an issue is spotted.

For preview testing, Vercel automatically generates preview URLs on every PR.

## Project Structure

```
app/                # Next.js App Router routes and layout
components/         # Shared UI building blocks (cards, navigation, etc.)
lib/                # Sanity client helpers and GROQ queries
public/             # Static assets
schemas/            # Sanity schema definitions for posts and pages
scripts/            # Utility scripts for maintenance
content/            # Legacy markdown posts (optional reference)
```

## Troubleshooting

- **Sanity requests return empty arrays** – Confirm `SANITY_PROJECT_ID` and `SANITY_DATASET` in `.env.local`.
- **Studio embed is blank** – Provide `NEXT_PUBLIC_SANITY_STUDIO_URL` or run Studio separately in your Sanity project.
- **Images do not load** – Ensure the Sanity dataset has public assets or configure a read token.
- **Build fails on CI** – Run `npm run lint` and `npm run build` locally to surface actionable errors before pushing.

You’re ready to iterate quickly, keep editors productive, and grow Grounded Living without paid features yet.
