import Link from "next/link";

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://pinterest.com", label: "Pinterest" },
  { href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand/30 bg-[#fdf8f3]/95">
      <div className="container-base grid gap-8 py-12 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="font-serif text-2xl font-semibold text-accent">Grounded Living</p>
          <p className="max-w-sm text-sm leading-relaxed text-accent-soft">
            A sanctuary for gentle rituals, nourishing recipes, and the kind of mindful encouragement that makes slow living feel attainable.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm md:items-end">
          <div className="flex flex-wrap gap-3 text-accent-soft">
            {socialLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-accent">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-700">
            © {new Date().getFullYear()} Grounded Living
          </p>
        </div>
      </div>
    </footer>
  );
}
