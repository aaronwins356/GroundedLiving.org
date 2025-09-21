import type { Post, PortableTextBlock, PortableTextSpan } from "../types/post";

function createSpan(_key: string, text: string, marks: string[] = []): PortableTextSpan {
  return {
    _key,
    _type: "span",
    text,
    ...(marks.length ? { marks } : {}),
  };
}

function createParagraph(_key: string, text: string): PortableTextBlock {
  return {
    _key,
    _type: "block",
    style: "normal",
    children: [createSpan(`${_key}-span`, text)],
  };
}

export const posts: Post[] = [
  {
    _id: "post-grounding-morning",
    title: "A Five-Minute Grounding Morning Ritual",
    slug: "grounding-morning",
    publishedAt: "2024-08-14T00:00:00.000Z",
    excerpt:
      "Begin your day with a grounding practice that anchors your nervous system and cultivates gratitude.",
    content: [
      createParagraph(
        "grounding-intro",
        "A slow, sensory-rich morning ritual can transform your day. This five-minute sequence brings you back to your body before the notifications start buzzing.",
      ),
      {
        _key: "grounding-step1-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("grounding-step1-heading-span", "Step 1: Arrival Breath")],
      },
      createParagraph(
        "grounding-step1",
        "Place one hand on your belly and one on your heart. Take three deep breaths, inhaling for four counts and exhaling for six.",
      ),
      {
        _key: "grounding-step2-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("grounding-step2-heading-span", "Step 2: Warm Beverage Meditation")],
      },
      createParagraph(
        "grounding-step2",
        "Prepare a mug of warm lemon water, tea, or coffee. Wrap your hands around it and notice the aroma before your first sip.",
      ),
      {
        _key: "grounding-step3-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("grounding-step3-heading-span", "Step 3: Intention Whisper")],
      },
      {
        _key: "grounding-step3",
        _type: "block",
        style: "normal",
        markDefs: [
          {
            _key: "grounding-link",
            _type: "link",
            href: "https://example.com/gratitude-journal",
          },
        ],
        children: [
          createSpan(
            "grounding-step3-span-1",
            "Whisper a gentle intention for your day. Keep it short, affirmative, and emotionally resonant. Let it guide your choices as you move through your schedule. If you need a journal prompt, this ",
          ),
          createSpan("grounding-step3-span-2", "guided gratitude notebook", ["grounding-link"]),
          createSpan("grounding-step3-span-3", " is a beautiful companion."),
        ],
      },
    ],
  },
  {
    _id: "post-seasonal-reset",
    title: "Design a Gentle Seasonal Reset",
    slug: "seasonal-reset",
    publishedAt: "2024-09-01T00:00:00.000Z",
    excerpt: "Create a calming 7-day ritual to transition between seasons without overwhelm.",
    content: [
      createParagraph(
        "reset-intro",
        "Transitioning between seasons can stir up our nervous system. Instead of forcing a dramatic detox, try a gentle reset that centers your body and mind.",
      ),
      {
        _key: "reset-day1-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("reset-day1-heading-span", "Day 1: Clear Space Intentionally")],
      },
      createParagraph(
        "reset-day1",
        "Light a candle, turn on a favorite playlist, and spend 15 minutes refreshing one corner of your home. Focus on textures and scents that make you exhale deeper.",
      ),
      {
        _key: "reset-day3-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("reset-day3-heading-span", "Day 3: Nourish with Warmth")],
      },
      createParagraph(
        "reset-day3",
        "Prepare a pot of mineral-rich broth or herbal tea. Sip slowly while you journal about the feelings the season is bringing forward for you.",
      ),
      {
        _key: "reset-day5-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("reset-day5-heading-span", "Day 5: Move with Gratitude")],
      },
      createParagraph(
        "reset-day5",
        "Stretch, dance, or walk barefoot if the weather allows. Match each movement with a statement of gratitude for your body.",
      ),
      {
        _key: "reset-day7-heading",
        _type: "block",
        style: "h2",
        children: [createSpan("reset-day7-heading-span", "Day 7: Integrate")],
      },
      createParagraph(
        "reset-day7",
        "Close your week by writing a letter to your future self about the rituals you want to carry forward. Seal it with an intention and revisit it when the next season arrives.",
      ),
    ],
  },
];

export function getAllPosts(): Post[] {
  return posts.slice();
}
