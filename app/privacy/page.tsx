import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Understand how Grounded Living collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Privacy Policy</h1>
      <p>Effective date: September 20, 2024</p>
      <p>
        At Grounded Living, your privacy matters. This policy outlines the information we collect, how we use it, and the
        choices you have regarding your data when interacting with our website and newsletter.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Contact details you voluntarily share, such as your name and email address.</li>
        <li>Messages submitted through our contact form.</li>
        <li>Anonymous analytics data gathered through cookies to improve your experience.</li>
      </ul>
      <h2>How We Use Information</h2>
      <p>We process your data to:</p>
      <ul>
        <li>Send newsletters and mindful living resources you request.</li>
        <li>Respond to your messages and feedback.</li>
        <li>Analyze site performance and create content that resonates with our community.</li>
      </ul>
      <h2>Your Choices</h2>
      <p>
        You may unsubscribe from emails at any time using the link provided in our newsletters. To request deletion of your
        personal data, contact us at hello@groundedliving.org.
      </p>
      <h2>Updates</h2>
      <p>
        We may update this policy to reflect new practices or legal requirements. We will note the effective date above so
        you know when changes take effect.
      </p>
    </article>
  );
}
