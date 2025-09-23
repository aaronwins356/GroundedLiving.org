import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-cream-200/80 bg-white/50">
      <div className="section-shell flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-200/70 text-lg font-heading text-sage-600 shadow-inner">
            GL
          </span>
          <p className="max-w-xl text-sm text-[#4c544c]">
            Grounded Living is a calming space for soulful wellness, thoughtful nourishment, and intentional living.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-[#3b443b]">
          <Link href="https://www.instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-sage-500">
            Instagram
          </Link>
          <Link href="https://www.pinterest.com" target="_blank" rel="noreferrer" className="transition hover:text-sage-500">
            Pinterest
          </Link>
          <Link href="mailto:hello@groundedliving.org" className="transition hover:text-sage-500">
            Email
          </Link>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-taupe-400">
          © {new Date().getFullYear()} Grounded Living. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
