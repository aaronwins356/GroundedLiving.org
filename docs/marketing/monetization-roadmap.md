# Phase-One Monetization Roadmap

Grounded Living can build sustainable revenue by layering affiliate partnerships and low-impact ads without disturbing the editorial voice. This roadmap translates the strategic brief into executable workstreams for the next 90 days.

## Guiding Principles
- **Serve the reader first.** Prioritise trusted recommendations that align with holistic living values.
- **Be transparent.** Maintain disclosure banners above the fold and inline reminders near calls to action.
- **Protect performance.** Reserve ad slots, lazy-load third-party scripts, and validate Core Web Vitals after each integration.
- **Measure everything.** Instrument outbound affiliate clicks and ad impressions to evaluate ROI and prioritise future investment.

## Phase Breakdown

| Phase | Timeline | Objectives | Key Deliverables |
| --- | --- | --- | --- |
| **1. Foundation** | Weeks 1–2 | Secure affiliate approvals and prepare infrastructure. | Affiliate applications submitted, disclosure components enabled, link management tooling configured. |
| **2. Affiliate Content Sprint** | Weeks 3–6 | Publish high-intent commerce content and retrofit legacy posts. | 6–10 monetisation-ready posts, "My Wellness Toolkit" evergreen page, updated CTAs and newsletter funnels. |
| **3. Starter Ads** | Weeks 6–8 | Introduce AdSense placements without degrading UX. | Approved AdSense account, 2–3 responsive ad slots, updated performance baselines. |
| **4. Optimisation Loop** | Ongoing | Monitor revenue mix, iterate placements, and plan upgrades. | Monthly KPI report, testing backlog, roadmap to premium ad networks. |

## Affiliate Program Playbook
1. **Apply to diversified networks.** Focus on Amazon Associates, Thrive Market, Mountain Rose Herbs, Our Place, and one supplement marketplace (Fullscript or similar). Use secure storage (Vercel env vars or CMS secrets) for keys.
2. **Evaluate offers quarterly.** Track commission rates, cookie duration, EPC, and alignment with our sourcing standards. Replace underperformers proactively.
3. **Centralise link management.** Configure ThirstyAffiliates/Pretty Links with `/go/<partner>` slugs to simplify swaps and attribution.
4. **Compliance checklist.** Map FTC disclosure copy to Markdown partials and React components so editors cannot remove them.

## Integration Patterns
- **Contextual mentions:** Embed links where products solve a reader problem (e.g., "I steep this [organic chamomile blend] before bed").
- **Feature boxes:** Use Tailwind-styled callouts (`<ProductHighlight />`) for high-value recommendations and to group bundles.
- **Roundups & reviews:** Publish buyer’s guides, comparison posts, and seasonal kits that naturally host 5–10 affiliate links.
- **Resource hub:** Launch `/resources` as a curated list with filters for kitchen, herbal apothecary, and mindful living.
- **Email amplification:** Reflect blog recommendations in the welcome series and monthly digest to reinforce conversions.

## Starter Content Pipeline
Create briefs in Notion, then draft, shoot, and publish the following posts (optimised for long-tail keywords and schema):

1. **Best Organic Herbal Teas for Relaxation** – highlight Thrive Market bundles and Amazon samplers.
2. **7 Tools Every Home Cook Needs for Healthy Recipes** – lean on Our Place, Vitamix, and sustainable storage partners.
3. **Top 5 Supplements for Gut Health** – incorporate practitioner guidance and Fullscript store links.
4. **Eco-Friendly Kitchen Swaps for a Sustainable Home** – promote reusable wraps, glass storage, and bamboo utensils.
5. **Morning Rituals Toolkit** – feature adaptogenic coffees, meditation apps, and sunrise lamps.
6. **Thrive Market vs. Whole Foods: Pantry Staples Showdown** – comparison table with affiliate CTAs.

Each article must include:
- Affiliate disclosure at top and prior to any product grid.
- Minimum three lifestyle or product images (compressed for performance).
- Newsletter CTA module and optional lead magnet (e.g., "7-day gut health meal plan").
- Outbound links tagged with UTM parameters: `utm_source=blog&utm_medium=affiliate&utm_campaign=<slug>`.

## Ad Strategy
- **AdSense readiness:** Confirm site passes AdSense policy checks, submit application in Week 6, and add the verification meta tag through Next.js `metadata` API.
- **Placement guidelines:**
  - Desktop sidebar unit (`300x600`) below the newsletter signup.
  - Responsive in-article unit injected after the first H2 using an Ad Inserter block or custom React slot.
  - Footer banner limited to 1 per page.
- **Performance safeguards:**
  - Reserve container heights to prevent CLS.
  - Lazy-load using the Intersection Observer hook already in the component library.
  - Re-run Lighthouse and WebPageTest; maintain Performance score ≥ 90.
- **Upgrade criteria:** Once traffic exceeds 50k sessions/month and RPM ≥ $5 for 3 consecutive months, prepare applications for Mediavine or Raptive.

## Tracking & Analytics
- **Affiliate events:** Fire `affiliate_click` events via Google Tag Manager when users interact with `/go/` links; send partner name and product category as parameters.
- **Revenue dashboard:** Consolidate affiliate and AdSense payouts in a shared Looker Studio report with monthly, rolling 90-day, and YoY views.
- **A/B testing:** Use existing experimentation playbook to test CTA placement, hero modules, and product grid density. Prioritise tests that can move CTR from 2% → 3%.
- **Goal targets:**
  - Affiliate CTR ≥ 2% within 60 days.
  - First $100 affiliate payout by Day 90.
  - Ad RPM ≥ $2 without lowering average session duration.

## UX & Editorial Safeguards
- Cap to **three ad units max** per page until premium networks handle density.
- Ban auto-play video ads, disruptive pop-ups, and interstitials.
- Maintain clear voice guidelines so recommendations read as trusted advice, not sales copy.
- Run quarterly accessibility audits to ensure ads and callouts remain screen-reader friendly.

## Operational Checklist
- [ ] Affiliate disclosures tested across templates.
- [ ] `/resources` page designed, built, and populated.
- [ ] Link cloaking plugin deployed with automated broken-link checks.
- [ ] AdSense verification and slot components deployed behind feature flags for staged rollout.
- [ ] Monthly reporting cadence agreed with editorial and growth teams.

## Next Steps
1. Submit affiliate applications and capture account details in the credentials vault.
2. Build the disclosure + product highlight components (refer to component backlog ticket GL-UI-42).
3. Draft briefs for the first three roundup posts and schedule photoshoots.
4. Audit existing articles for retrofit opportunities (goal: add contextual links to at least 10 legacy posts).
5. Prepare AdSense technical implementation in a feature branch so it can be toggled on post-approval.

Executing this roadmap will validate Grounded Living’s audience intent, demonstrate early revenue traction, and set the stage for future commerce offerings without compromising trust or site performance.
