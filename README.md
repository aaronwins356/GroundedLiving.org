# Grounded Living

Grounded Living is a calming wellness journal built with Next.js 15, Tailwind CSS, Contentful for dynamic blog entries, and Prismic for evergreen pages. The refreshed design leans into a soft cream palette, airy spacing, and elegant serif typography to echo the Healing Soulfully aesthetic while remaining future-ready for affiliate features, ads, and an eventual shop.

## Tech stack

- **Framework:** Next.js 15 with the App Router and React Server Components
- **Styling:** Tailwind CSS utility layers with custom prose typography
- **CMS:** Contentful (blog posts) + Prismic (pages)
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
   CONTENTFUL_SPACE_ID=
   CONTENTFUL_ENVIRONMENT=master
   CONTENTFUL_DELIVERY_TOKEN=
   CONTENTFUL_PREVIEW_TOKEN=
   CONTENTFUL_BLOG_POST_CONTENT_TYPE=blogPost
   CONTENTFUL_MANAGEMENT_TOKEN= # optional, required for webhook automation
   VERCEL_DEPLOY_HOOK_URL= # optional, required for webhook automation
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to browse the site.

> **Note:** The project falls back to a CDN-hosted Tailwind build so local builds succeed even if `node_modules` is unavailable. After running `npm install tailwindcss`, you can switch the `@import` in `app/globals.css` back to `"tailwindcss/index.css"`.

## Contentful setup

1. Create (or open) a Contentful space and environment. Use the **Delivery API token** for `CONTENTFUL_DELIVERY_TOKEN` and the **Preview API token** for `CONTENTFUL_PREVIEW_TOKEN` if you plan to preview unpublished posts.
2. Define a **Blog Post** content model with the following field IDs so they align with the code expectations:
   - `title` (Short text)
   - `slug` (Short text, unique)
   - `publishedDate` (Date & time)
   - `categoryName` (Short text, optional)
   - `categorySlug` (Short text, optional)
   - `categoryColor` (Short text, optional — hex value)
   - `excerpt` (Long text, optional)
   - `description` (Long text, optional)
   - `tags` (List of short text values)
   - `coverImage` (Media, accepts one asset)
   - `body` (Rich text)
3. Publish at least one entry so the blog and homepage have content to render.
4. Store your space ID, environment ID, and tokens in `.env.local` as shown above.

### Webhook → Vercel deploy hook

Contentful can notify Vercel whenever a blog post is published. Create a Vercel deploy hook (Vercel dashboard → Project → Settings → Deploy Hooks) and copy the generated URL into `VERCEL_DEPLOY_HOOK_URL`.

You can then create the webhook in Contentful either via the UI or programmatically. The following `curl` snippet uses the Management API and the environment variables from `.env.local`:

```bash
curl -X POST "https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/webhook_definitions" \
  -H "Authorization: Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}" \
  -H "Content-Type: application/vnd.contentful.management.v1+json" \
  -d @- <<'JSON'
{
  "name": "Vercel deploy hook",
  "url": "${VERCEL_DEPLOY_HOOK_URL}",
  "topics": ["Entry.publish"],
  "filters": [
    {
      "equals": [
        { "doc": "sys.environment.sys.id" },
        "${CONTENTFUL_ENVIRONMENT}"
      ],
      "and": [
        {
          "equals": [
            { "doc": "sys.contentType.sys.id" },
            "${CONTENTFUL_BLOG_POST_CONTENT_TYPE}"
          ]
        }
      ]
    }
  ]
}
JSON
```

> The filters ensure that only published blog posts trigger rebuilds. If you prefer to manage webhooks in the Contentful UI, replicate the same configuration: event `Entry publish`, environment filter, and content type filter set to your blog post model.

## Prismic setup

1. Create (or open) a Prismic repository named `groundedliving`.
2. In **Custom Types**, create the repeatable `page` type using [`prismic-custom-types/page.json`](./prismic-custom-types/page.json) for evergreen pages such as About, Contact, and Shop landing content.
3. Publish at least one About Page so sidebar callouts have copy.
4. In **Settings → Webhooks**, add a webhook pointing to:
   ```
   https://YOUR-VERCEL-DEPLOYMENT/api/revalidate?secret=PRISMIC_REVALIDATE_SECRET
   ```
   Enable it for `documents.publish` events. Use the same secret you placed in `.env.local`.

Non-technical editors only need to log in at [https://prismic.io](https://prismic.io) to manage evergreen pages—no embedded Studio is required.

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

- **Posts**: Publish through Contentful using the Blog Post model described above. The blog index auto-features the latest post, category filters, and renders rich text with the custom renderer.
- **Pages**: Use Prismic’s `page` custom type for evergreen pages like About, Contact, or Shop landing content.
- **Revalidation**: Contentful deploy hooks trigger Vercel rebuilds, while the Prismic webhook continues to ping `/api/revalidate` for static pages.

## Design highlights

- **Navigation**: Sticky cream navigation bar with hover underlines for Home, Blog, About, and Shop (coming soon).
- **Blog index**: Hero spotlight with featured post, gentle category chips, and a 3-column journal grid.
- **Post page**: Full-width rounded cover image, centered typography, Tailwind-powered prose, share buttons, and sidebar space for affiliates.
- **Home page**: Hero CTA, category discovery chips, recent stories grid, and an About preview pulled directly from Prismic.

## Troubleshooting

- **Missing content**: Confirm your Contentful space/environment IDs and tokens are correct, and that entries are published. Also verify your Prismic repository matches `PRISMIC_REPOSITORY_NAME` for evergreen pages.
- **Revalidation failing**: Double-check the Contentful webhook deploy hook URL and (if using the script) that `CONTENTFUL_MANAGEMENT_TOKEN` has access. Ensure the Prismic webhook secret matches `PRISMIC_REVALIDATE_SECRET`.
- **Images not loading**: Ensure assets are published in Contentful and that the Next.js image remote patterns allow your Contentful asset domains.
- **Build errors**: Run `npm run lint`, `npm run typecheck`, and `npm run build` locally to surface issues early.

With this setup, editors can publish soulful stories in Contentful and manage evergreen pages in Prismic while the codebase remains production-ready for Vercel deployments and future growth.
