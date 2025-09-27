# Grounded Living Welcome Series

A five-email nurture journey that delivers value first, establishes trust, and gently introduces affiliate partners once subscribers are primed.

## Email 1 – Subject: "Welcome to your grounding ritual" (Day 0)
- **Intent:** Deliver the promised lead magnet immediately and set expectations.
- **Key elements:**
  - Hero link to the subscriber’s selected resource (auto-personalized via the `lg` query param).
  - Brief origin story about Grounded Living’s mission and cadence (weekly Sunday send + seasonal check-ins).
  - Soft CTA to add our address to their contacts plus a teaser of upcoming topics.
- **PS:** Invite readers to reply with their biggest seasonal challenge for qualitative insights.

## Email 2 – Subject: "Your 3-step evening wind-down" (Day 3)
- **Intent:** Reinforce value with a practical mini ritual sourced from top-performing posts.
- **Key elements:**
  - 3 actionable steps with estimated time commitments.
  - Embedded testimonial pull-quote from the community.
  - CTA to explore the “Evening Ritual Checklist” PDF for deeper guidance (non-sales).
- **PS:** Link to a mindfulness audio on the blog to encourage site revisit.

## Email 3 – Subject: "Seasonal kitchen staples you'll love" (Day 7)
- **Intent:** Introduce food-first support that connects to the Whole-Food Breakfast Blueprint magnet.
- **Key elements:**
  - Curated grocery list with swaps for various dietary needs.
  - Mini poll (linking to `/thank-you?lg=whole-food-breakfast-blueprint`) to choose their breakfast persona.
  - CTA to read the “Pantry essentials for calm mornings” blog post.
- **PS:** Invite readers to forward the email to a friend who needs calmer mornings.

## Email 4 – Subject: "Tools we actually rely on" (Day 12)
- **Intent:** Warm affiliate introduction via authentic recommendations.
- **Key elements:**
  - Story-led intro about solving a community pain point.
  - Feature three affiliate partners (e.g., Thrive Market, Our Place pan, high-quality adaptogen brand) with evidence-backed benefits.
  - Explicit disclosure line above the module and reiteration of our review criteria.
- **CTA:** Button leading to the "Toolkit for Slow Living" roundup post.

## Email 5 – Subject: "Choose your next ritual" (Day 20)
- **Intent:** Segmentation + retention.
- **Key elements:**
  - Interactive prompt linking to the on-site poll (saves preference in localStorage).
  - Buttons for three pathways: Sleep rituals, Seasonal cooking, Nervous system care.
  - Encourage subscribers to update their preferences (link to profile center once available).
- **CTA:** Invite readers to follow us on Instagram or YouTube for behind-the-scenes rituals.

---

### Implementation Notes
- Configure in ESP with behavior-based delays (pause Email 2 if the subscriber hasn’t opened Email 1 within 72 hours).
- Tag subscribers based on magnet (`lead-magnet:herbal-remedies`, `lead-magnet:whole-food-breakfasts`, etc.) to personalize dynamic blocks.
- Track `welcome_series_open` and `welcome_series_click` events via the analytics layer to monitor the 45% / 5% targets.
- After Email 5, transition subscribers to the weekly digest with the chosen topic emphasis.
