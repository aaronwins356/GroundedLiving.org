import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { LeadMagnetDownloadButton } from "@/components/site/LeadMagnetDownloadButton";
import { canonicalFor } from "@/lib/seo/meta";
import { webPageSchema } from "@/lib/seo/schema";

const CANONICAL_URL = canonicalFor("/thank-you").toString();

const LEAD_MAGNETS: Record<string, { title: string; description: string; file: string }> = {
  "evening-ritual-checklist": {
    title: "Evening Ritual Checklist",
    description: "A gentle framework to help you unwind, reset, and close the day with intention.",
    file: "/lead-magnets/evening-ritual-checklist.pdf",
  },
  "herbal-remedies-cold-season": {
    title: "5 Herbal Remedies for Cold Season",
    description:
      "A concise reference for easing cold season discomfort with trusted botanicals, safety notes, and brewing guidance.",
    file: "/lead-magnets/herbal-remedies-cold-season.pdf",
  },
  "whole-food-breakfast-blueprint": {
    title: "7-Day Whole-Food Breakfast Blueprint",
    description:
      "Seven quick-prep, dietitian-reviewed breakfasts with macros, swap ideas, and prep notes for calmer mornings.",
    file: "/lead-magnets/whole-food-breakfast-blueprint.pdf",
  },
};

export const metadata: Metadata = {
  title: "You're in — check your inbox | Grounded Living",
  description:
    "Thanks for joining the Grounded Living circle. Confirm your email and grab the Evening Ritual Checklist to wind down with intention.",
  alternates: {
    canonical: CANONICAL_URL,
  },
};

interface ThankYouPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const magnetKeyRaw = params?.lg;
  const magnetKey = typeof magnetKeyRaw === "string" && LEAD_MAGNETS[magnetKeyRaw] ? magnetKeyRaw : "evening-ritual-checklist";
  const magnet = LEAD_MAGNETS[magnetKey];
  const doubleOptIn = (process.env.NEWSLETTER_DOUBLE_OPT_IN ?? "true").toLowerCase() === "true";
  const schema = webPageSchema({
    name: "Newsletter Confirmation",
    url: CANONICAL_URL,
    description:
      "Grounded Living newsletter confirmation page with access to the Evening Ritual Checklist lead magnet.",
  });

  return (
    <Container className="thank-you">
      <JsonLd item={schema} id="thank-you-schema" />
      <div className="thank-you__inner">
        <h1>Thanks for joining Grounded Living</h1>
        <p>
          We’re so glad you’re here. {doubleOptIn ? "Check your email for a quick confirmation link." : "Here’s your download—enjoy it tonight."}
        </p>
        <div className="thank-you__card">
          <h2>{magnet.title}</h2>
          <p>{magnet.description}</p>
          <LeadMagnetDownloadButton
            href={magnet.file}
            magnetKey={magnetKey}
            label={`Download the ${magnet.title}`}
            className="thank-you__download"
          />
          {doubleOptIn ? (
            <p className="thank-you__note">
              Once you confirm your subscription we’ll send the checklist (and future rituals) straight to your inbox.
            </p>
          ) : (
            <p className="thank-you__note">We’ve also emailed a copy so you can revisit it anytime.</p>
          )}
        </div>
        <p className="thank-you__hint">
          Tip: add <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@groundedliving.org"}`}>our email</a> to your
          address book so the good stuff never lands in spam.
        </p>
      </div>
    </Container>
  );
}
