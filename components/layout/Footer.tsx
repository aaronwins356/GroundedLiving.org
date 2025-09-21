import Link from "next/link";

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://pinterest.com", label: "Pinterest" },
  { href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand/10 bg-white/80">
      <div className="container-base flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-accent">Grounded Living</p>
          <p className="max-w-sm text-sm text-accent-soft">
            Soulful stories and practical rituals to help you slow down, nourish your body, and grow a grounded life.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm md:items-end">
          <div className="flex gap-3 text-accent-soft">
            {socialLinks.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-accent">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-accent-soft">
            © {new Date().getFullYear()} Grounded Living. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
