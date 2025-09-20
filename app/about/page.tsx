import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about the mission behind Grounded Living and the woman who started it.",
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">About Grounded Living</h1>
      <p className="text-lg text-slate-600">
        Grounded Living is a mindful wellness space led by holistic health educator Maya Thompson. Through evidence-based
        practices and soulful storytelling, Maya helps women integrate balance, rest, and intentional nourishment into
        their daily lives.
      </p>
      <div className="space-y-4 text-slate-600">
        <p>
          After years of working in fast-paced corporate environments, Maya experienced burnout firsthand. Her healing
          journey guided her to functional nutrition, yoga, and mindfulness—tools she now shares with readers and
          students around the globe.
        </p>
        <p>
          The blog features seasonal recipes, breathwork techniques, and reflections on creating rituals that support
          emotional resilience. Every article is grounded in compassion and practicality so you can integrate the wisdom
          at your own pace.
        </p>
        <p>
          When she’s not writing or teaching, you can find Maya sipping herbal tea, hiking coastal trails, and nurturing
          her community garden.
        </p>
      </div>
    </div>
  );
}
