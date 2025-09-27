import type { ShopProduct } from "@project-types/shop";

const DEFAULT_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL ?? "https://buy.stripe.com/test_placeholder_checkout";

function toEnvKey(slug: string): string {
  return `NEXT_PUBLIC_STRIPE_${slug.replace(/-/g, "_").toUpperCase()}_CHECKOUT_URL`;
}

function resolveCheckoutUrl(product: ShopProduct): string {
  const envKey = toEnvKey(product.slug);
  const envOverride = process.env[envKey];
  return envOverride ?? product.checkoutFallbackUrl ?? DEFAULT_CHECKOUT_URL;
}

const PRODUCTS: ShopProduct[] = [
  {
    slug: "solstice-soothe-syrup",
    sku: "GL-SYR-001",
    name: "Solstice Soothe Syrup",
    tagline: "Small-batch elderberry, ginger, and reishi syrup for immune resilience.",
    shortDescription:
      "Our signature winter syrup layers triple-extracted elderberries with warming botanicals to coat throats and fortify immunity without refined sweeteners.",
    longDescription:
      "Solstice Soothe is simmered in micro-batches using organic berries, local raw honey, and a slow infusion of ginger, reishi, and astragalus. Each bottle ships with a digital dosing guide so your household knows how to lean on it daily or during the first tickle of a cold.",
    priceCents: 3200,
    priceCurrency: "USD",
    netWeight: "8 oz glass bottle",
    badges: ["Small batch", "Honey sweetened", "Ships chilled"],
    benefits: [
      {
        title: "Daily immune ally",
        description:
          "Layered botanicals help prime innate immunity so you feel supported all season without reaching for synthetic supplements.",
      },
      {
        title: "Kid-approved flavor",
        description:
          "Raw honey and cinnamon keep the blend smooth enough for picky palates while staying free of artificial flavors.",
      },
      {
        title: "Traceable sourcing",
        description:
          "Every ingredient is certified organic and either farm-direct or verified through our herbalist co-op for potency.",
      },
    ],
    ingredients: [
      "Organic elderberries",
      "Raw Oregon honey",
      "Fresh ginger root",
      "Ceylon cinnamon",
      "Astragalus root",
      "Reishi mushroom",
      "Lemon peel",
    ],
    usage: [
      {
        title: "Daily ritual",
        description: "Take 1 tsp straight or in warm water as a tonic once per day to maintain resilience.",
      },
      {
        title: "Acute support",
        description: "Increase to 1 tsp every 3 hours at the first sign of seasonal crud for up to 48 hours.",
      },
      {
        title: "Family friendly",
        description: "Cut the serving in half for ages 3–7 and always consult your pediatrician for younger kiddos.",
      },
    ],
    includes: [
      "8 oz amber glass bottle with tamper-evident seal",
      "Reusable wooden dosing spoon",
      "Digital dosing & contraindication guide (PDF)",
    ],
    shippingNotes:
      "Ships from our Oregon kitchen within 3 business days. Cold-pack insulation is added May–September. Applicable sales tax and real-time shipping rates surface at Stripe checkout.",
    storageNotes: "Refrigerate after opening and enjoy within 6 months for best flavor.",
    safetyNotes: [
      "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.",
      "Consult your healthcare provider if you are pregnant, nursing, on medication, or have a chronic medical condition.",
    ],
    featuredPosts: ["herbalists-winter-cabinet", "seasonal-reset"],
    checkoutFallbackUrl: "https://buy.stripe.com/test_4gwcN72pl3zQ48QdQQ",
    image: {
      src: "/shop/solstice-soothe-syrup.svg",
      alt: "Amber bottle of Solstice Soothe Syrup surrounded by fresh ginger, elderberries, and cinnamon sticks.",
      width: 1200,
      height: 960,
    },
    seo: {
      title: "Solstice Soothe Elderberry Syrup",
      description:
        "Organic elderberry syrup simmered with ginger, astragalus, and reishi. Small-batch, honey sweetened, and shipped cold for winter resilience.",
    },
  },
  {
    slug: "evening-grounding-oil",
    sku: "GL-OIL-002",
    name: "Evening Grounding Body Oil",
    tagline: "A nervine-rich anointing oil to slow the nervous system before rest.",
    shortDescription:
      "Infused sesame and jojoba oils steeped with skullcap, tulsi, and chamomile to help you unwind during evening abhyanga rituals.",
    longDescription:
      "Crafted for nightly self-massage, Evening Grounding Oil blends nervine botanicals with lightweight oils that absorb without residue. We infuse each batch for six weeks, then finish with lavender and cedarwood for a forested exhale.",
    priceCents: 2800,
    priceCurrency: "USD",
    netWeight: "4 oz glass pump",
    badges: ["Vegan", "Herbalist formulated", "Abhyanga ready"],
    benefits: [
      {
        title: "Signals your circadian rhythm",
        description:
          "Consistent evening massage helps train the body for sleep by combining touch, scent, and warmth.",
      },
      {
        title: "Soothes overworked muscles",
        description:
          "Infused skullcap and tulsi ease tension while jojoba delivers a cushiony glide for tired joints.",
      },
      {
        title: "Non-greasy finish",
        description:
          "Lightweight oils sink in within minutes so you can slip into linens without stains.",
      },
    ],
    ingredients: [
      "Organic sesame oil",
      "Cold-pressed jojoba oil",
      "Skullcap",
      "Tulsi",
      "Roman chamomile",
      "Lavender essential oil",
      "Cedarwood essential oil",
      "Vitamin E",
    ],
    usage: [
      {
        title: "Warm & apply",
        description: "Warm 1–2 pumps between palms, then massage feet to heart using long, slow strokes.",
      },
      {
        title: "Layer with breath",
        description: "Pair with five rounds of box breathing to deepen the downshift response.",
      },
      {
        title: "Weekly deep soak",
        description: "Add a pump to bath salts for a weekly nervous system reset.",
      },
    ],
    includes: [
      "4 oz UV-protective glass bottle with pump",
      "Guided audio for a 5-minute abhyanga ritual",
      "Printable evening routine checklist",
    ],
    shippingNotes:
      "Ships carbon-neutral within the continental US. Taxes are calculated automatically at checkout based on your shipping address.",
    storageNotes: "Store away from direct sunlight and use within 9 months of opening.",
    safetyNotes: [
      "External use only. Patch test before full-body application.",
      "Avoid during pregnancy due to concentrated tulsi and cedarwood essential oils.",
    ],
    featuredPosts: ["grounding-morning", "seasonal-reset", "toolkit-for-slow-living"],
    checkoutFallbackUrl: "https://buy.stripe.com/test_cN2aG42pl6Ns2xa7st",
    image: {
      src: "/shop/evening-grounding-oil.svg",
      alt: "Bottle of Evening Grounding Oil resting on linen with sprigs of chamomile and tulsi leaves.",
      width: 1200,
      height: 960,
    },
    seo: {
      title: "Evening Grounding Body Oil",
      description:
        "Herbal abhyanga oil infused with skullcap, tulsi, and chamomile to unwind muscles and signal your nervous system for rest.",
    },
  },
  {
    slug: "clarity-breath-steam-kit",
    sku: "GL-STM-003",
    name: "Clarity Breath Steam Kit",
    tagline: "Herbal steam blend and tools for clearing sinuses and quieting anxious minds.",
    shortDescription:
      "A reusable ceramic bowl, linen drape, and aromatic herb blend that transforms any corner into a breathwork sanctuary.",
    longDescription:
      "Clarity pairs organic eucalyptus, rosemary, and mugwort with calming lavender to open airways while keeping nerves soothed. The kit includes our favorite heat-proof bowl and a breathable linen drape so setup takes under two minutes.",
    priceCents: 5400,
    priceCurrency: "USD",
    badges: ["Reusable tools", "Includes guided practice", "Seasonal favorite"],
    benefits: [
      {
        title: "Opens congested pathways",
        description: "Essential oils released in the steam help you breathe deeper through seasonal shifts and long workdays.",
      },
      {
        title: "Encourages mindful pauses",
        description: "The ritual slows everything down, making space for presence before or after stressful meetings.",
      },
      {
        title: "Low-impact setup",
        description: "The included tools fold into a cotton pouch so you can reset on the go or tuck them in a small drawer.",
      },
    ],
    ingredients: [
      "Eucalyptus leaves",
      "Rosemary",
      "Lavender buds",
      "Peppermint",
      "Mugwort",
      "Juniper berry",
    ],
    usage: [
      {
        title: "Prepare the space",
        description: "Boil 4 cups of water, add 2 tbsp of the blend, and tent the linen over your head and bowl.",
      },
      {
        title: "Breathe intentionally",
        description: "Inhale through the nose for 4 counts, hold for 4, exhale for 6. Repeat for up to 10 minutes.",
      },
      {
        title: "Reuse mindfully",
        description: "Compost spent herbs and rinse the bowl after each session. Refill blends available seasonally.",
      },
    ],
    includes: [
      "12 steam sessions worth of herbal blend",
      "Hand-thrown ceramic steam bowl",
      "Breathable linen tent",
      "Audio-guided breath practice & playlist",
    ],
    shippingNotes:
      "Ships in recyclable packaging within 5 business days. Stripe checkout surfaces live carrier rates plus state-by-state sales tax.",
    safetyNotes: [
      "Not recommended for children under 10 or individuals with uncontrolled asthma.",
      "Keep eyes closed during the steam and discontinue use if you feel lightheaded.",
    ],
    featuredPosts: ["calm-lighting-guide", "toolkit-for-slow-living"],
    checkoutFallbackUrl: "https://buy.stripe.com/test_28o7v64uT6Ns9cscMN",
    image: {
      src: "/shop/clarity-breath-steam-kit.svg",
      alt: "Ceramic bowl with steaming herbs beside a folded linen drape and eucalyptus sprigs.",
      width: 1200,
      height: 960,
    },
    seo: {
      title: "Clarity Breath Steam Kit",
      description:
        "A reusable steam ritual kit with eucalyptus, lavender, and a guided breathwork practice to clear sinuses and calm nerves.",
    },
  },
  {
    slug: "restorative-rhythm-planner",
    sku: "GL-DIG-004",
    name: "Restorative Rhythm Planner",
    tagline: "A 6-week digital workbook for rebuilding energy with gentle structure.",
    shortDescription:
      "Editable Notion and PDF templates that help you plot meals, movement, and sleep anchors without rigid rules.",
    longDescription:
      "Restorative Rhythm collects our most trusted check-ins—from circadian prompts to nourishment trackers—into an approachable digital planner. It pairs beautifully with coaching or self-led resets when you need accountability without hustle culture pressure.",
    priceCents: 1800,
    priceCurrency: "USD",
    badges: ["Instant download", "Editable", "Great for reset season"],
    benefits: [
      {
        title: "Create gentle accountability",
        description: "Weekly spreads nudge you to track sleep, hydration, and mood so you can spot patterns early.",
      },
      {
        title: "Flexible formats",
        description: "Use the fillable PDF for printing or duplicate the Notion workspace for collaborative planning.",
      },
      {
        title: "Nutrition-friendly",
        description: "Built-in meal rhythm templates ensure your grocery list reflects grounding staples, not decision fatigue.",
      },
    ],
    ingredients: [
      "6 weekly planning spreads",
      "Circadian rhythm worksheet",
      "Habit momentum tracker",
      "Meal planning grid",
      "Reflection prompts",
    ],
    usage: [
      {
        title: "Duplicate or download",
        description: "Choose the Notion template or PDF file immediately after checkout.",
      },
      {
        title: "Set weekly anchors",
        description: "Spend 15 minutes each Sunday locking in three daily anchors—wake, movement, and meals.",
      },
      {
        title: "Reflect & adjust",
        description: "Use the end-of-week prompts to decide what to keep, tweak, or release for the next cycle.",
      },
    ],
    includes: [
      "Notion template link",
      "Fillable PDF download",
      "Email mini-course with six audio prompts",
    ],
    shippingNotes: "Delivered instantly by email with lifetime updates. No shipping fees or taxes in most US states.",
    safetyNotes: [
      "Planning tool only; does not provide medical, nutritional, or mental health advice.",
      "Consult your healthcare provider before making significant changes to diet, exercise, or supplements.",
    ],
    featuredPosts: ["grounding-morning", "weekly-meal-prep-flow"],
    checkoutFallbackUrl: "https://buy.stripe.com/test_9AQaG45Jldba1gY5op",
    image: {
      src: "/shop/restorative-rhythm-planner.svg",
      alt: "Tablet displaying the Restorative Rhythm Planner beside a pen and herbal tea.",
      width: 1200,
      height: 960,
    },
    seo: {
      title: "Restorative Rhythm Planner",
      description:
        "A 6-week digital planner with circadian check-ins, meal grids, and gentle accountability to rebuild energy without burnout.",
    },
  },
];

export function getAllProducts(): ShopProduct[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): ShopProduct | null {
  return PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export function getProductForPost(postSlug: string): ShopProduct | null {
  return PRODUCTS.find((product) => product.featuredPosts.includes(postSlug)) ?? null;
}

export function getCheckoutUrl(product: ShopProduct): string {
  return resolveCheckoutUrl(product);
}

export function getCheckoutEnvKey(slug: string): string {
  return toEnvKey(slug);
}
