# Grounded Living

A Next.js 14 website for Grounded Living, featuring a Markdown-powered blog, Tailwind CSS styling, SEO defaults, and
Stripe-ready monetization hooks.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

If you do not have environment variables configured yet, copy `.env.example` to `.env.local` and edit values as needed.

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site. The pages include:

- `/` – Hero section introducing Grounded Living.
- `/blog` – Markdown-powered blog index.
- `/blog/[slug]` – Individual post rendered with Tailwind Typography.
- `/about`, `/contact`, `/privacy`, `/premium` – Supporting pages with shared navigation and footer.

## Markdown Blog Workflow

Blog posts live in `content/posts`. Each file uses YAML frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-09-01"
category: "Mindfulness"
tags:
  - wellness
  - ritual
description: "One-line summary shown on the blog index."
---

Your Markdown content goes here. Standard Markdown headings, lists, quotes, and images are supported.
```

1. Create a new `.md` file inside `content/posts` following the example above.
2. Save the file. Dynamic routes are automatically generated based on the filename.
3. The blog index will display the post title, description, category, date, and a “Read More” button.

Any standard Markdown link will automatically render with the `<AffiliateLink>` component, opening in a new tab with the
required `rel="sponsored noopener noreferrer"` attributes. Write links as usual:

```markdown
[Favorite Product](https://example.com/product)
```

## Stripe Premium Checkout

The `/premium` page includes a “Subscribe for $5/month” button that calls the Stripe Checkout API route. Provide these
environment variables to enable live Stripe sessions:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_SITE_URL=https://www.groundedliving.org
```

Without the keys, the API will log a warning and return Stripe’s test dashboard URL as a placeholder.

## Newsletter + Contact Forms

Both the footer newsletter form and the contact page form currently log submissions to the browser console. Replace the
handlers with API requests or external service integrations when you are ready to capture real data.

## SEO & Crawling

- Dynamic `<head>` metadata is powered by Next.js `generateMetadata`.
- `app/sitemap.ts` builds a sitemap that lists all static routes and blog posts.
- `app/robots.ts` allows all agents and references the sitemap.

## Styling

Tailwind CSS and the Typography plugin are configured in `tailwind.config.ts`. Global styles live in `app/globals.css`.
The layout uses a centered container with consistent spacing and white background for easy customization.

## Deployment

1. Build for production:

   ```bash
   npm run build
   npm run start
   ```

2. Deploy to any Node.js host (e.g., Hostinger) by uploading the project, installing dependencies, setting environment
   variables, and running `npm run start` behind a process manager like PM2.

3. Remember to set `NEXT_PUBLIC_SITE_URL` to the deployed domain so the sitemap and Stripe callback URLs are correct.

## Project Structure

```
app/                # Next.js App Router pages and API routes
components/         # Reusable UI components and forms
content/posts/      # Markdown blog posts with frontmatter
lib/                # Content helpers and utilities
public/             # Static assets (Open Graph image, favicons, etc.)
```

Enjoy building a grounded, mindful content experience!
