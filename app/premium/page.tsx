import type { Metadata } from "next";
import { CheckoutButton } from "../../components/forms/CheckoutButton";

export const metadata: Metadata = {
  title: "Premium Membership",
  description: "Unlock exclusive mindful living guides, seasonal meal plans, and live workshops for $5/month.",
};

export default function PremiumPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grounded Living Premium</h1>
      <p className="text-lg text-slate-600">
        Become a premium member to access ad-free articles, guided meditations, weekly Q&A sessions, and downloadable
        resources designed to deepen your practice.
      </p>
      <ul className="list-disc space-y-2 pl-6 text-slate-600">
        <li>Fresh mindful living lessons delivered every week.</li>
        <li>Members-only community calls with Maya.</li>
        <li>Seasonal recipe bundles and habit trackers.</li>
      </ul>
      <CheckoutButton />
      <p className="text-sm text-slate-500">
        You’ll be redirected to a secure Stripe Checkout page in test mode. Use the test card 4242 4242 4242 4242 with any
        future expiry date to simulate a purchase.
      </p>
    </div>
  );
}
