import Link from "next/link";

export const revalidate = 0;

export default function CheckoutPlaceholderPage() {
  return (
    <div className="section-shell space-y-8">
      <header className="surface-card flex flex-col gap-4 px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-sage-500">Digital Offerings</p>
        <h1 className="font-heading text-4xl text-[#3b443b]">Stripe checkout coming soon</h1>
        <p className="text-sm text-[#4c544c]">
          This page is prepped for your future courses, templates, and rituals. Connect Stripe keys in Vercel and update the
          server action when you\'re ready to launch.
        </p>
      </header>
      <div className="surface-card px-8 py-10">
        <ol className="space-y-4 text-sm text-[#4c544c]">
          <li>
            <strong className="font-semibold text-[#3b443b]">1. Configure Stripe keys</strong> – add
            <code className="mx-2">STRIPE_SECRET_KEY</code> and <code className="mx-2">STRIPE_PRICE_ID</code> to your Vercel
            project.
          </li>
          <li>
            <strong className="font-semibold text-[#3b443b]">2. Update checkout action</strong> – swap the placeholder POST
            request for <code>stripe.checkout.sessions.create</code> and redirect to the returned URL.
          </li>
          <li>
            <strong className="font-semibold text-[#3b443b]">3. Celebrate</strong> – automate fulfillment via webhooks and let
            readers enjoy your offering.
          </li>
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="https://dashboard.stripe.com/register"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-sage-600"
          >
            Create Stripe account
          </Link>
          <Link
            href="/pages/contact"
            className="inline-flex items-center gap-2 rounded-full border border-sage-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sage-500 transition hover:border-sage-400 hover:bg-sage-100/80"
          >
            Request setup help
          </Link>
        </div>
      </div>
    </div>
  );
}
