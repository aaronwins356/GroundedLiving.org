import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop", comingSoon: true },
];

export function Navbar() {
  return (
    <header className="border-b border-brand/10 bg-white/80 backdrop-blur">
      <div className="container-base flex flex-wrap items-center justify-between gap-4 py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-accent">
          Grounded Living
        </Link>
        <nav>
          <ul className="flex items-center gap-3 text-sm font-medium text-accent-soft">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-100/70 hover:text-accent"
                >
                  {item.label}
                  {"comingSoon" in item && item.comingSoon ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-brand-600">
                      Soon
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
