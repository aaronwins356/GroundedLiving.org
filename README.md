# Grounded Living

Grounded Living is a modern wellness journal built with Next.js 15, Tailwind CSS, and Sanity. The codebase is structured so you
can spin it up locally in minutes, give editors a welcoming Studio, and ship updates to Vercel with confidence. The refreshed
design leans into a soft cream backdrop, muted sage accents, and elegant typography to mirror the calm presence of Healing
Soulfully.

## Tech stack

- **Framework:** Next.js 15 (App Router + React Server Components)
- **Styling:** Tailwind CSS with custom typography and a muted sage/blue palette inspired by Healing Soulfully
- **CMS:** Sanity Studio mounted directly inside the Next.js app at `/studio`
- **Content:** Portable Text for rich posts and pages
- **Deployment:** Vercel with automated GitHub Actions deploys

## 1. Local development in three steps

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
   NEXT_PUBLIC_SANITY_PROJECT_ID=yourProjectId
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_VERSION=2024-05-01
   SANITY_READ_TOKEN= # optional – only required for private datasets or draft previews
   SANITY_REVALIDATE_SECRET=choose-a-long-random-string
   ```

Then start the dev server:

```bash
npm run dev
```

- [http://localhost:3000](http://localhost:3000) – the public site
- [http://localhost:3000/studio](http://localhost:3000/studio) – Sanity Studio embedded in the app

> Tip: If you haven’t created a Sanity project yet, run `npm create sanity@latest` first. Drop the generated `projectId` and
> `dataset` into `.env.local` and the Studio will instantly connect.

## 2. Sanity Studio editing experience

Sanity Studio is embedded directly in the Next.js app using `next-sanity/studio` so non-technical editors can log in with the
same URL they use to browse the blog.

- **Posts** include: title, slug, category, publish date, excerpt, cover image with alt text, and rich Portable Text content. The editor uses a pared-back WYSIWYG with headings, lists, links, and inline formatting to keep writing approachable.
- **Pages** include: title, slug, optional hero image, and full Portable Text content using the same simplified toolbar.
- The desk structure keeps “Posts” and “Pages” as the only entry points so the interface stays approachable.
- A webhook can hit `/api/revalidate` with your `SANITY_REVALIDATE_SECRET` to refresh cached content whenever you publish.

### Setting up the webhook

1. In the Sanity manage interface, go to **API → Webhooks**.
2. Create a new webhook pointing to `https://your-vercel-domain/api/revalidate?secret=YOUR_SECRET` (or your local tunnel when
   testing).
3. Enable the webhook for the `create`, `update`, `delete`, and `publish` events on the `post` and `page` document types.
4. When the webhook fires, the API route revalidates all pages tagged with Sanity content so new posts show up immediately.

## 3. Everyday developer workflows

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with fast refresh. |
| `npm run lint` | Run ESLint using the `next/core-web-vitals` ruleset. |
| `npm run build` | Create a production build (includes type checking). |
| `npm run typecheck` | Run `tsc --noEmit` for standalone type safety verification. |

Always run `npm run lint && npm run build` (or `npm run typecheck`) before opening a PR so CI mirrors local results.

## 4. Deployment pipeline (GitHub → Vercel)

The repository includes `.github/workflows/deploy.yml` which powers CI/CD:

1. Caches npm dependencies for faster builds.
2. Runs `npm run lint` and `npm run build` on every push and pull request.
3. On successful pushes to `main`, triggers a production deploy via the Vercel CLI.

To enable deployments you need three GitHub repository secrets:

| Secret | Description |
| --- | --- |
| `VERCEL_TOKEN` | Personal token from the Vercel dashboard (Profile → Account Settings → Tokens). |
| `VERCEL_ORG_ID` | Found in the Vercel project settings (`vercel link` also prints it). |
| `VERCEL_PROJECT_ID` | The project identifier from the Vercel dashboard. |

Add them in **GitHub → Settings → Secrets and variables → Actions → New repository secret**. Once configured, every merge into
`main` will lint, build, and deploy automatically.

## 5. Design system highlights

- **Homepage hero:** Rotating featured carousel framed by a cream-and-sage gradient, serif headlines, and CTA buttons that echo the Healing Soulfully aesthetic.
- **Category discovery:** Clickable category badges with hover animations on the homepage and `/blog` index encourage exploration.
- **Post layout:** Large cover imagery, share buttons, linked categories, an about sidebar, and a mindful ad placeholder make every article feel editorial.
- **Global styling:** Google Fonts (Work Sans + Fraunces) linked in the root layout and applied through Tailwind for a polished, calming voice.

## 6. Future growth hooks

- Monetization placeholders (affiliate cards, banner slots, `/shop` route) are in place but inactive.
- The design leaves room for newsletter modules or featured product rails without reworking layout fundamentals.

## 7. Project structure

```
app/                # App Router routes, layout, and API handlers
components/         # Reusable UI components (cards, navigation, rich text)
lib/                # Sanity client helpers, GROQ queries, and image utilities
schemas/            # Sanity schema definitions for posts and pages
public/             # Static assets (favicons, OG image)
.github/workflows/  # GitHub Actions for CI/CD
```

## 8. Troubleshooting

- **Blank Studio:** Double-check `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`. Without them the Studio renders an empty shell.
- **Content not updating:** Confirm the webhook is hitting `/api/revalidate` with the correct secret and that your pages use the
  provided revalidation tags.
- **Image URLs look broken:** Ensure the Sanity dataset is public or provide `SANITY_READ_TOKEN` for private datasets.
- **Build failures:** Run `npm run lint`, `npm run build`, and `npm run typecheck` locally to catch issues before CI.

With these pieces in place you can confidently create content, preview changes, and ship updates without touching complex setup
steps every time.
