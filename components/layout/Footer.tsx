import Link from "next/link";
import { NewsletterForm } from "../forms/NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="container-base py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Grounded Living</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Mindful health and lifestyle inspiration delivered straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <h3 className="font-semibold text-slate-800">Explore</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Legal</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/premium">Premium</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-slate-500">© {new Date().getFullYear()} Grounded Living. All rights reserved.</p>
      </div>
    </footer>
  );
}
