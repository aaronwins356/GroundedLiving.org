import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop", comingSoon: true },
];

export function Navbar() {
  return (
    <header className="border-b border-brand/20 bg-[#fdf8f3]/90 backdrop-blur">
      <div className="container-base flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex flex-col">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-accent">
            Grounded Living
          </Link>
          <span className="text-xs uppercase tracking-[0.4em] text-brand-600">Soulful wellness &amp; slow living</span>
        </div>
        <nav>
          <ul className="flex items-center gap-2 text-sm font-medium text-accent-soft">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-100/70 hover:text-accent"
                >
                  {item.label}
                  {"comingSoon" in item && item.comingSoon ? (
                    <span className="rounded-full bg-brand-200/50 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-brand-700">
                      Soon
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/blog?category=Newsletter"
                className="inline-flex items-center rounded-full border border-brand-400/50 bg-white px-5 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-800"
              >
                Newsletter
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
