# Grounded Living Editorial SEO Engine

This blueprint operationalizes Grounded Living's editorial SEO flywheel. It aligns topic selection, production workflows, technical hygiene, and promotion so every post compounds authority, traffic, and conversions.

## 1. Pillars, Cornerstones & Cluster Map

| Pillar | Cornerstone (3000–5000 words) | Supporting Cluster Posts (800–1500 words) | Primary Conversion Offer |
| --- | --- | --- | --- |
| Holistic Remedies & Wellness | **The Complete Guide to Natural Remedies for Stress & Sleep** | *Herbal teas for sleep*, *guided breathing techniques*, *adaptogen primer*, *magnesium bath soak DIY*, *restorative bedtime yoga* | Calm Evenings Rituals guide |
| Nutrition & Gut Health | **Gut Health 101: Foods, Habits & Recipes for Better Digestion** | *Fermented foods starter kit*, *kombucha brewing*, *probiotic smoothie meal plan*, *low-FODMAP comfort recipes*, *prebiotic pantry checklist* | Nourish Digest email series |
| Healthy Recipes | **50 Wholesome Recipes for Busy Weeknights** | *Anti-inflammatory dinner plan*, *protein-rich breakfasts*, *diabetic-friendly desserts*, *plant-forward soups*, *30-minute sheet pan meals* | 7-day immunity meal plan (PDF) |
| Sustainable Living & Mindful Habits | **Beginner’s Guide to Mindful, Sustainable Living** | *Low-waste kitchen swaps*, *mindful budgeting for wellness*, *seasonal rhythm planner*, *family wellness toolkit*, *home sanctuary reset* | Seasonal Reset workbook |

**Cluster rules**
- Every supporting post links to its cornerstone + 2–3 peer posts + one cross-pillar recommendation.
- Cornerstones feature hub navigation cards for all supporting posts and targeted lead magnet modules.
- Update the internal link map quarterly; log additions in `context/internal-link-matrix.json`.

## 2. Keyword Research & Mapping

1. **Source keywords** monthly using Google Search Console, Ahrefs, and RankIQ seed lists (see `/docs/editorial/keyword-brief-template.md`). Prioritize KD ≤35 and intent-aligned terms (informational, transactional, navigational).
2. **Cluster keywords** by search intent. Maintain the canonical map in `context/keyword-map.csv` with columns: `pillar`, `cornerstone`, `supporting_post`, `primary_keyword`, `secondary_keywords`, `search_volume`, `keyword_difficulty`, `intent`, `conversion_offer`.
3. **Assign content types**: recipes → transactional/informational hybrid, remedies → informational with safety disclaimers, mindful living → informational.
4. **Briefing cadence**: generate at least four briefs per month, two recipes, one remedy, one lifestyle. Tag briefs with publish priority (P1 = seasonal/launch-dependent, P2 = evergreen backlog).
5. **Validation**: before drafting, confirm SERP analysis (top 5 results, content gaps, schema types) is captured in each brief.

## 3. Production Workflow (RACI)

| Stage | Responsible | Accountable | Consulted | Informed | Key Outputs |
| --- | --- | --- | --- | --- | --- |
| Ideation & Prioritization | SEO Strategist | Editorial Lead | Analytics, Partnerships | Founder | Updated content calendar |
| Keyword Brief | SEO Strategist | Editorial Lead | Subject Matter Expert (SME) | Writers | Approved brief in Notion + repo |
| Outline | Writer | Editorial Lead | SME | SEO Strategist | Outline following `/docs/editorial/outline-template.md` |
| Draft | Writer | Editorial Lead | SEO Strategist | Design | Markdown draft in `/content/posts` with schema placeholders |
| SEO & Fact Check | SEO Strategist | Editorial Lead | SME (as needed) | Writer | Completed `/docs/editorial/optimization-checklist.md` |
| Copy Edit & QA | Copyeditor | Editorial Lead | SEO Strategist | Design | Final markdown + assets uploaded |
| Publish | Managing Editor | Editorial Lead | Dev Lead | Newsletter team | Production-ready post, images, meta validated |
| Promotion | Marketing Manager | Editorial Lead | Partnerships | All | Distribution checklist completion |
| Performance Review | Analytics | Editorial Lead | SEO Strategist | Stakeholders | 30/60-day performance snapshot |

**Weekly cadences**
- Monday stand-up: review pipeline status, blockers, new keyword data.
- Wednesday review: outline approvals and schema QA.
- Friday retro: content shipped, performance insights, refresh backlog updates.

## 4. Editorial Checklist Enhancements

Augment existing `draft` and `optimization` checklists with the following mandatory steps:
- **Metadata validation**: ensure `seo_title` ≤60 chars, `seo_description` 150–160 chars, includes CTA.
- **Schema QA**: run Google Rich Results Test on staging URL before publish; attach screenshot to PR.
- **Conversion placement**: inline newsletter CTA after 30% scroll (`<NewsletterCallout variant="{cluster}" />`) and end-of-post CTA with pillar-specific lead magnet.
- **Expert citation requirement**: minimum of two authoritative external citations (PubMed, Mayo Clinic, NIH). Note citation URLs in frontmatter `sources` array.
- **Accessibility**: every image includes descriptive `alt`; ensure color contrast on embedded graphics meets WCAG AA.

## 5. Technical Enablement

- **Templates**: leverage App Router MDX pipeline. Each post frontmatter must include `pillar`, `cluster`, `primaryKeyword`, `secondaryKeywords`, `ctaVariant`, and `relatedSlugs` arrays. Lint for presence using the editorial CLI (see Tools section).
- **Schema automation**: extend `lib/seo/buildSchema.ts` to read frontmatter and auto-generate `Article`, `Recipe`, or `HowTo` JSON-LD. Recipes must expose nutrition data when available.
- **Content linting**: add `scripts/content-lint.ts` (Node) to enforce metadata length, single H1, internal link count ≥3, alt text presence. Run via `npm run lint:content` in CI.
- **Image workflow**: compress assets using `scripts/prepare-images.ts` (Sharp) producing 640/960/1280 widths and WebP variants. Store outputs in `public/images/posts/<slug>/`.
- **Analytics dashboard**: configure Looker Studio dashboard ingesting GA4 + Search Console. Include widgets for CTR, impressions, top converting CTAs, average time on page, and schema errors.

## 6. Distribution Protocol

1. **Newsletter**: feature new posts in weekly roundup with cluster-specific hook + CTA. Track UTMs (`utm_source=newsletter&utm_medium=email&utm_campaign=<cluster>`).
2. **Pinterest**: design 2–3 vertical pins per recipe/remedy (1000×1500). Schedule via Tailwind. Include keyword-rich descriptions and link to canonical URL.
3. **Instagram**: share carousel or reel summarizing key tips; include link-in-bio update pointing to cluster hub.
4. **Syndication**: pitch cornerstone summaries to partner newsletters/podcasts quarterly. Always include canonical link request.
5. **Search Console**: submit new URLs, monitor coverage and enhancement reports weekly.

## 7. Refresh & Optimization Cycle

- **Quarterly audit**: filter posts older than 6 months; evaluate rankings, CTR, conversions. Queue updates prioritizing posts with declining impressions or CTR <3%.
- **Refresh actions**: update stats, add new FAQs, improve internal links, test new CTA copy, and revalidate schema.
- **Versioning**: track refresh date in frontmatter `lastUpdated`. Note major changes in `context/content-changelog.md`.

## 8. Success Metrics & Targets

| Metric | Target (6–12 months) | Data Source | Owner |
| --- | --- | --- | --- |
| Published posts | 4+/month; 50–100 total | Content calendar, Git history | Editorial Lead |
| Organic sessions | +50–100% QoQ growth | GA4 | SEO Strategist |
| Long-tail rankings | 10–15 keywords in top 3 | Search Console | SEO Strategist |
| Newsletter sign-up rate | ≥2% site-wide | GA4 events + ESP | Marketing Manager |
| Avg time on page | ≥2:30 | GA4 | Analytics |
| CTA conversion attribution | 100% tracked via UTMs/events | GA4, ESP | Marketing Manager |
| Recipe schema validity | 100% | Search Console Enhancements | Dev Lead |

## 9. Implementation Roadmap

| Week | Focus | Key Deliverables |
| --- | --- | --- |
| 1 | Alignment & setup | Approve blueprint, configure dashboards, audit existing content inventory |
| 2 | Tooling | Ship content lint script, schema automation updates, image pipeline |
| 3 | Content pipeline | Finalize keyword map, produce 4 briefs, update Notion board |
| 4 | Production | Publish first batch (1 recipe, 1 remedy, 1 lifestyle, 1 cornerstone refresh) |
| Ongoing | Optimization | Weekly workflow cadences, quarterly refreshes, KPI reporting |

## 10. Governance

- Document updates via PRs referencing this blueprint.
- Quarterly review of strategy with stakeholders to adjust clusters, offers, and tooling.
- Maintain a single source of truth in this repository to keep editorial, SEO, design, and engineering aligned.

Adhering to this engine turns each article into a discoverable, engaging, and monetizable asset for Grounded Living.
