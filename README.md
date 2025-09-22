# Grounded Living

Grounded Living is a calming wellness journal built with Next.js 15, Tailwind CSS, and Prismic. The refreshed design leans into a soft cream palette, airy spacing, and elegant serif typography to echo the Healing Soulfully aesthetic while remaining future-ready for affiliate features, ads, and an eventual shop.

## Tech stack

- **Framework:** Next.js 15 with the App Router and React Server Components
- **Styling:** Tailwind CSS utility layers with custom prose typography
- **CMS:** Prismic (hosted UI) with custom Post and Page types
- **Language:** TypeScript with strict settings
- **Deployment:** Vercel (runs `npm run lint`, `npm run typecheck`, `npm run build`)

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy the environment template**
   ```bash
   cp .env.local.example .env.local
   ```
3. **Fill in `.env.local`**
   ```dotenv
   PRISMIC_REPOSITORY_NAME=groundedliving
   PRISMIC_ACCESS_TOKEN= # optional for public repos
   PRISMIC_REVALIDATE_SECRET=choose-a-long-random-string
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to browse the site.

## Prismic setup

1. Create (or open) a Prismic repository named `groundedliving`.
2. In **Custom Types**, create two new repeatable types using the JSON files in [`prismic-custom-types/`](./prismic-custom-types/):
   - `post.json` – Title, UID, publish date, category, excerpt, rich body content, and cover image.
   - `page.json` – Title, UID, rich content, and hero image.
3. Publish at least one Post and an About Page.
4. In **Settings → Webhooks**, add a webhook pointing to:
   ```
   https://YOUR-VERCEL-DEPLOYMENT/api/revalidate?secret=PRISMIC_REVALIDATE_SECRET
   ```
   Enable it for `documents.publish` events. Use the same secret you placed in `.env.local`.

Non-technical editors only need to log in at [https://prismic.io](https://prismic.io) to manage posts and pages—no embedded Studio is required.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run lint` | Run ESLint using the `next/core-web-vitals` ruleset. |
| `npm run typecheck` | Run `tsc --noEmit` for type safety. |
| `npm run build` | Create a production build. |

Always run lint, typecheck, and build before pushing to ensure CI mirrors local results.

## Deployment workflow

1. Push to GitHub – GitHub Actions runs `npm run lint`, `npm run typecheck`, and `npm run build`.
2. On success, Vercel creates a preview deployment.
3. Merging to `main` triggers a production deploy.

Ensure the Vercel project has the same environment variables configured as `.env.local`.

## Content editing flow

- **Posts**: Publish through Prismic using the “Post” custom type. The blog index auto-features the latest post, category filters, and renders body copy with Tailwind Typography.
- **Pages**: Use the “Page” custom type for evergreen pages like About, Contact, or Shop landing content.
- **Revalidation**: Publishing content triggers the webhook to refresh cached pages via `/api/revalidate`.

## Design highlights

- **Navigation**: Sticky cream navigation bar with hover underlines for Home, Blog, About, and Shop (coming soon).
- **Blog index**: Hero spotlight with featured post, gentle category chips, and a 3-column journal grid.
- **Post page**: Full-width rounded cover image, centered typography, Tailwind-powered prose, share buttons, and sidebar space for affiliates.
- **Home page**: Hero CTA, category discovery chips, recent stories grid, and an About preview pulled directly from Prismic.

## Troubleshooting

- **Missing content**: Confirm your Prismic repository matches `PRISMIC_REPOSITORY_NAME` and that custom types are published.
- **Revalidation failing**: Double-check the webhook URL and that `PRISMIC_REVALIDATE_SECRET` matches the environment variable.
- **Images not loading**: Ensure assets are published in Prismic and that the Next.js image remote patterns allow your repository domain.
- **Build errors**: Run `npm run lint`, `npm run typecheck`, and `npm run build` locally to surface issues early.

With this setup, editors can create and publish soulful stories directly in Prismic, while the codebase remains production-ready for Vercel deployments and future growth.
