import type { Metadata } from "next";

import { RecipeLayout } from "@/components/recipes/RecipeLayout";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeCardProps } from "@/components/recipes/RecipeCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
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

const FEATURED_RECIPES: ReadonlyArray<RecipeCardProps> = [
  {
    title: "Sunrise Adaptogen Latte",
    description: "Cordyceps, turmeric, and coconut butter to ignite a calm, sustained morning energy without spikes.",
    href: "/recipes/sunrise-adaptogen-latte",
    image: {
      src: "/images/recipes/moon-milk.svg",
      alt: "Stoneware mug with adaptogen latte surrounded by herbs",
    },
    meta: {
      prep: "5 mins",
      cook: "7 mins",
      yield: "1 mug",
    },
  },
  {
    title: "Glow Greens Superfood Broth",
    description: "Mineral-dense broth concentrate with moringa, kelp, and shiitake to sip or fold into grains.",
    href: "/recipes/glow-greens-broth",
    image: {
      src: "/images/recipes/moon-milk.svg",
      alt: "Jar of vibrant green broth with spoon and herbs",
    },
    meta: {
      prep: "10 mins",
      cook: "45 mins",
      yield: "4 cups",
    },
  },
  {
    title: "Evening Magnesium Cocoa",
    description: "Magnesium glycinate, raw cacao, and tart cherry for deeper sleep support in a cozy, modern tonic.",
    href: "/recipes/evening-magnesium-cocoa",
    image: {
      src: "/images/recipes/moon-milk.svg",
      alt: "Cup of evening cocoa with cinnamon and candle",
    },
    meta: {
      prep: "5 mins",
      cook: "8 mins",
      yield: "2 mugs",
    },
  },
];

export default function RecipesLandingPage() {
  return (
    <Section className="bg-surface-canvas">
      <Container className="space-y-16">
        <Reveal as="header" className="max-w-3xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-moss-600">Recipes</p>
          <h1 className="font-display text-4xl">Rooted nourishment for calm energy</h1>
          <p className="text-lg text-ink-soft md:w-3/4">
            Our kitchen lab works through every ritual recipe with clinical herbalists and dietitians. Each template keeps prep easy,
            ingredients functional, and presentation print-friendly.
          </p>
        </Reveal>

        <Reveal>
          <RecipeLayout {...SAMPLE_RECIPE} />
        </Reveal>

        <Reveal as="section" className="space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-moss-600">Recipe library</p>
              <h2 className="font-display text-3xl">Print-ready favourites</h2>
            </div>
            <p className="max-w-xl text-sm text-ink-soft">
              Each recipe card is typeset for half-sheet printing and quick sharing. Save them to your tablet cookbook or pin to
              the fridge for weekly planning.
            </p>
          </div>
          <ul className="recipe-card-grid" role="list">
            {FEATURED_RECIPES.map((recipe) => (
              <li key={recipe.title} className="recipe-card-grid__item">
                <RecipeCard {...recipe} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
