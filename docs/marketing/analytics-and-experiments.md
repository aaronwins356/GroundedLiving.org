# Analytics & Experimentation Cadence

This plan establishes the measurement layer and growth rituals for Grounded Living. It turns the new commerce surface into a learning loop over the next 90 days.

## Stack & instrumentation

- **Google Analytics 4** – Already wired via the consent-aware `Gtag` component. Configure the property and ensure the Measurement ID lives in `NEXT_PUBLIC_GA_ID`.
- **Search Console** – Add the property for `groundedliving.org` (and the `www` prefix). Verification meta tag is exposed through `NEXT_PUBLIC_GSC_VERIFICATION`.
- **Stripe** – Each product can override its checkout session via `NEXT_PUBLIC_STRIPE_<PRODUCT>_CHECKOUT_URL`. This keeps revenue reporting clean per SKU.
- **Key custom events** – Fired automatically when consent allows analytics:
  - `shop_index_viewed` – triggered on `/shop` with `product_count`.
  - `shop_product_viewed` – fired from PDPs with `sku`, `slug`, `price`, and `currency`.
  - `shop_module_viewed` / `shop_module_clicked` – emitted when the blog “Shop the remedy” module renders or is tapped.

Track conversions inside GA4 with custom dimensions for `sku` and `post_slug` so attribution flows from editorial content to checkout intent.

## Core KPIs

| Area | KPI | 90-day target |
| --- | --- | --- |
| Organic growth | Sessions from organic search | +50% vs baseline |
| Retention | Returning-user rate | +2pp |
| Email | Newsletter sign-ups | +30% list growth |
| Commerce | Stripe revenue & first 10 orders | Achieve within 60 days |
| Affiliate | Qualified outbound clicks | First payouts logged |

## Dashboards

1. **Acquisition overview** – GA4 report filtered by channel grouping and top landing URLs. Include CWV metrics from Vercel Speed Insights.
2. **Content health** – Search Console query + page report highlighting rising long-tail terms. Update the sheet quarterly with impressions, clicks, and CTR deltas.
3. **Monetization** – Stripe dashboard filtered by product plus GA4 exploration using the custom shop events.
4. **Email & retention** – Newsletter provider metrics layered with GA4 returning-user cohorts.

## Quarterly content review

Every quarter:

1. Pull Search Console queries with >20 impressions and <2% CTR.
2. Refresh corresponding posts: tighten intros, add new subheadings, and weave in internal links to cornerstone guides.
3. Update topical clusters and annotate in the dashboard. Target a 15% lift in pageviews per refreshed URL within 30 days.

## Experiment backlog

| Experiment | Hypothesis | Status |
| --- | --- | --- |
| Newsletter CTA placement (hero vs inline) | Moving the CTA into the first screen will improve opt-in rate | TODO |
| Hero treatments (static vs carousel) | Static hero with single CTA improves LCP and engagement | TODO |
| Related-posts algorithm | Switching from recency to category match improves depth per session | TODO |

Document results in a rolling Google Doc or Notion board so the learn → ship cycle compounds.

## Backlinks & outreach

- Publish 1 guest post per month on aligned wellness blogs with do-follow citations.
- Participate in relevant practitioner forums and include the shop URL in bios (no spam).
- Pitch collaborations (IG Lives, workshops) that naturally highlight the remedies.

## Habits & review cadence

- **Weekly** – Check GA4 for anomalies, review Stripe events, and inspect support inbox for product questions that hint at friction.
- **Monthly** – Update the dashboards, note experiments shipped, and review backlink progress.
- **Quarterly** – Run the SEO refresh process, reprioritize experiments, and evaluate new monetization levers (affiliate partners, workshops, etc.).

Stay patient—authority compounds slowly. The consistency of publishing, linking, and iterating is what unlocks sustainable traffic and revenue.
