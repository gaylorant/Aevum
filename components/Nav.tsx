import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/circles", label: "Circles" },
  { href: "/lifebook", label: "Lifebook" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  return (
    <header className="border-b border-Sameva-border bg-Sameva-surface/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-Sameva-ink">
          Sameva
        </Link>
        <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-Sameva-muted transition-colors hover:bg-Sameva-accent/10 hover:text-Sameva-accent"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
