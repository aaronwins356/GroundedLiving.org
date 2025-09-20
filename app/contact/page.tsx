import type { Metadata } from "next";
import { ContactForm } from "../../components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out to the Grounded Living team for collaborations, questions, or feedback.",
};

export default function ContactPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Let’s Connect</h1>
        <p className="text-slate-600">
          Have a question about a blog post, partnership opportunity, or wellness workshop? Share a few details and
          we’ll be in touch soon.
        </p>
        <p className="text-sm text-slate-500">
          The form currently sends your message to the console while we finish integrating our email service.
        </p>
      </div>
      <div className="lg:col-span-3">
        <ContactForm />
      </div>
    </div>
  );
}
