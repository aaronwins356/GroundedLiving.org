import type { Metadata } from "next";

import { RecipeLayout } from "@/components/recipes/RecipeLayout";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buildMetaTitle } from "@/lib/seo/title";
import { truncateAtBoundary } from "@/lib/seo/text";

const PAGE_TITLE = buildMetaTitle("Recipes");
const PAGE_DESCRIPTION = truncateAtBoundary(
  "Functional food and herbal tonics to keep your nervous system grounded. Each recipe is tested in our own kitchen and built for print-at-home ease.",
  155,
);

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
};

const SAMPLE_RECIPE = {
  title: "Moon Milk with Ashwagandha & Cardamom",
  description:
    "A velvety oat milk nightcap infused with adaptogens, magnesium, and warming spices to soothe the nervous system before bed.",
  hero: {
    src: "/images/recipes/moon-milk.svg",
    alt: "Steaming mug of moon milk with cinnamon stick and herbs",
  },
  meta: {
    prep: "5 mins",
    cook: "10 mins",
    total: "15 mins",
    yield: "2 mugs",
  },
  tags: ["Adaptogenic", "Caffeine-free", "Nervous system"],
  ingredients: [
    {
      heading: "Base",
      items: ["2 cups unsweetened oat milk", "1 tbsp almond butter", "1 tsp maple syrup", "Pinch of sea salt"],
    },
    {
      heading: "Herbal blend",
      items: ["1 tsp ashwagandha powder", "1/2 tsp cinnamon", "1/4 tsp ground cardamom", "1/8 tsp grated nutmeg"],
    },
    {
      heading: "Optional topping",
      items: ["Bee pollen", "Crushed rose petals", "Extra cinnamon"],
    },
  ] as const,
  steps: [
    {
      title: "Warm the base",
      description:
        "Combine oat milk, almond butter, maple syrup, and salt in a small saucepan over medium-low heat. Whisk until silky and steaming—avoid boiling to protect nutrients.",
    },
    {
      title: "Infuse the adaptogens",
      description:
        "Sprinkle in ashwagandha, cinnamon, cardamom, and nutmeg. Continue whisking for 3 minutes until the spices bloom and the milk smells fragrant.",
    },
    {
      title: "Blend and serve",
      description:
        "Transfer to a blender and blend on low for 20 seconds to froth. Pour into warmed mugs and finish with bee pollen or petals.",
    },
  ] as const,
  tips: (
    <ul>
      <li>Swap oat milk for coconut milk if you prefer extra richness.</li>
      <li>Whisk in 200 mg of magnesium glycinate powder for added relaxation support.</li>
      <li>For iced moon milk, chill after step two and blend with ice.</li>
    </ul>
  ),
} as const;

export default function RecipesLandingPage() {
  return (
    <Section className="bg-surface-canvas">
      <Container className="space-y-16">
        <header className="max-w-3xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-moss-600">Recipes</p>
          <h1 className="font-display text-4xl">Rooted nourishment for calm energy</h1>
          <p className="text-lg text-ink-soft md:w-3/4">
            Our kitchen lab works through every ritual recipe with clinical herbalists and dietitians. Each template keeps prep easy,
            ingredients functional, and presentation print-friendly.
          </p>
        </header>

        <RecipeLayout {...SAMPLE_RECIPE} />
      </Container>
    </Section>
  );
}
