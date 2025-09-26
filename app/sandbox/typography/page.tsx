import { ArticleShell } from "@/components/blog/ArticleShell";
import { Section } from "@/components/ui/Section";

export default function TypographySandboxPage() {
  return (
    <Section>
      <ArticleShell>
        <h1>Typography Sandbox</h1>
        <p>
          This sandbox page showcases the base typography rhythm, spacing, and component styles that
          power the Grounded Living design system. Use it to verify headings, lists, inline elements,
          and code samples.
        </p>
        <h2>Headlines and hierarchy</h2>
        <p>
          The display font leans on organic curves and generous letterforms. Paired with a steady body
          sans-serif, it keeps long-form articles approachable and easy to scan.
        </p>
        <h3>Supporting heading</h3>
        <p>
          Body copy maintains a comfortable measure and line height for extended reading. Inline
          elements like <strong>strong text</strong> and <em>emphasis</em> retain clarity against the
          bone background.
        </p>
        <blockquote>
          Grounding everyday choices in intention helps transform routines into rituals. Slow down,
          savor, and stay curious.
        </blockquote>
        <p>
          Ordered and unordered lists keep consistent spacing and rhythm:
        </p>
        <ul>
          <li>Gather seasonal produce and plan nourishing meals.</li>
          <li>Pause for breathwork during afternoon resets.</li>
          <li>Record reflections in a grounding journal.</li>
        </ul>
        <h2>Code samples</h2>
        <p>
          Technical posts benefit from callouts and code blocks with high-contrast palettes that remain
          easy on the eyes.
        </p>
        <pre>
          <code>
{`export function brewTea({ water, leaves }) {
  if (!water || !leaves) {
    throw new Error("Tea requires both water and leaves.");
  }

  return {
    steepTime: "4 minutes",
    temperature: "96C",
    message: "Sip slowly and stay grounded.",
  };
}
`}
          </code>
        </pre>
      </ArticleShell>
    </Section>
  );
}
