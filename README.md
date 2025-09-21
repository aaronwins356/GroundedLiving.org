# Grounded Living – Local Development Guide

Grounded Living is a content-rich marketing site and blog built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.
This guide walks you through preparing your machine, configuring environment variables, and running the application locally
with production-ready tooling.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Environment Variables](#environment-variables)
4. [Install Dependencies](#install-dependencies)
5. [Recommended IDE Setup](#recommended-ide-setup)
6. [Run the Development Server](#run-the-development-server)
7. [Quality Gates (Lint, Types, Build)](#quality-gates-lint-types-build)
8. [Blog Content Workflow](#blog-content-workflow)
9. [Stripe Premium Checkout](#stripe-premium-checkout)
10. [Newsletter + Contact Forms](#newsletter--contact-forms)
11. [SEO, Sitemap, and Robots](#seo-sitemap-and-robots)
12. [Project Structure](#project-structure)
13. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js 18.18+** (aligns with the Next.js 14 runtime). Install via [nvm](https://github.com/nvm-sh/nvm) or your
  preferred package manager.
- **npm 9+** is bundled with modern Node distributions. Verify with `npm --version`.
- **Git** for cloning and managing the repository.
- Optional: **Stripe test account** and API keys if you plan to exercise premium checkout locally.

## Clone the Repository

```bash
git clone https://github.com/<your-org>/GroundedLiving.org.git
cd GroundedLiving.org
```

> Replace `<your-org>` with the organization or user that hosts the repository. All subsequent commands assume you are in
> the project root.

## Environment Variables

Next.js reads secrets from `.env.local`. Start by copying the provided template:

```bash
cp .env.example .env.local
```

Update the values with your credentials:

- `NEXT_PUBLIC_SITE_URL` – Base URL used for absolute links and sitemap generation.
- `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` – Required to create live Stripe Checkout sessions (test mode keys work in
  development).
- Any additional environment variables referenced in API routes or integrations you enable.

> `.env.local` is ignored by Git. Never commit real secrets.

## Install Dependencies

```bash
npm install
```

This installs runtime dependencies such as Next.js and React, plus dev tooling like ESLint, TypeScript, and Tailwind CSS.

## Recommended IDE Setup

- **Visual Studio Code** with the following extensions:
  - *ESLint* for inline lint feedback.
  - *Tailwind CSS IntelliSense* for utility class autocompletion.
  - *Prettier* (optional) for consistent formatting.
- Enable TypeScript validation and ensure VS Code uses the workspace TypeScript version (`TypeScript: Select Version` →
  *Use Workspace Version*).

## Run the Development Server

Start the local server with hot reload:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the site.

- `/` – Landing page introducing Grounded Living services.
- `/blog` – Blog index built from Markdown posts.
- `/blog/[slug]` – Individual article pages with typography enhancements.
- `/about`, `/contact`, `/privacy`, `/premium` – Supporting marketing and policy pages.

Stop the server at any time with `Ctrl+C`.

## Quality Gates (Lint, Types, Build)

Run these commands before committing to ensure local changes match CI expectations:

```bash
# Static analysis
npm run lint

# Type safety checks
npx tsc --noEmit

# Production build verification
npm run build
```

`npm run lint` uses the Next.js `core-web-vitals` rule set. The type check leverages the same configuration as the
Next.js compiler, and `npm run build` catches production-only issues.

## Blog Content Workflow

Markdown posts live in [`content/posts`](content/posts). Each file requires YAML frontmatter:

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

1. Create a new `.md` file inside `content/posts` following the template above.
2. Save the file. Next.js automatically generates the route based on the filename.
3. Confirm the new post appears on `/blog` with the correct metadata and CTA.

Outbound affiliate links render through the `<AffiliateLink>` component with the proper `rel="sponsored noopener
noreferrer"` attributes—write Markdown links normally and the component handles the rest.

## Stripe Premium Checkout

The `/premium` page surfaces a “Subscribe for $5/month” call-to-action. When invoked, it triggers the Stripe Checkout API
route. To exercise the flow locally:

1. Populate `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` in `.env.local` with test-mode values.
2. Restart the dev server so Next.js reloads environment variables.
3. Click the button on `/premium`. Successful configuration redirects you to Stripe’s hosted checkout; missing keys log a
   warning and fall back to the Stripe dashboard URL for testing.

## Newsletter + Contact Forms

Both the footer newsletter form and `/contact` page currently log submissions to the browser console. Replace the handlers
with API routes or third-party integrations (e.g., Resend, ConvertKit) when you are ready to persist data.

## SEO, Sitemap, and Robots

- Metadata is generated per route with `generateMetadata` to keep titles, descriptions, and Open Graph tags in sync.
- [`app/sitemap.ts`](app/sitemap.ts) produces a sitemap that includes static pages and Markdown posts.
- [`app/robots.ts`](app/robots.ts) allows full crawling and references the sitemap.

Set `NEXT_PUBLIC_SITE_URL` accurately before building for production so canonical URLs are correct.

## Project Structure

```
app/                # Next.js App Router layouts, pages, API routes
components/         # Reusable UI primitives and feature components
content/posts/      # Markdown blog posts with frontmatter metadata
lib/                # Utility functions for content loading and formatting
public/             # Static assets (favicons, Open Graph imagery, etc.)
schemas/            # Schema definitions (e.g., Sanity or structured content)
scripts/            # Maintenance scripts for content or automation tasks
```

## Troubleshooting

- **Port already in use** – Change the dev server port with `npm run dev -- -p 4000`.
- **Environment variables not loading** – Ensure `.env.local` exists and restart the dev server after editing.
- **TypeScript errors in editor only** – Verify VS Code uses the workspace TypeScript version.
- **Build fails on `npm run build`** – Run `npm run lint` and `npx tsc --noEmit` to surface actionable errors, then rerun
  the build.

You now have everything needed to launch Grounded Living locally, iterate confidently, and ship production-quality
changes.
