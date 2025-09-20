import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container-base flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-primary-dark">
          Grounded Living
        </Link>
        <nav>
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded px-3 py-2 transition hover:bg-primary/10 hover:text-primary-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
