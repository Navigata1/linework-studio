import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";

const LINKS = [
  { href: "/#ethos", label: "Ethos" },
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "The Craft" },
  { href: "/hire", label: "Start a Project" },
];

export function Nav() {
  return (
    <header className="glass-toolbar backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-50">
      <div className="container-studio flex h-16 items-center justify-between">
        <Link href="/" aria-label="Linework Studios home">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mono px-3 py-2 text-[12px] tracking-wide text-[var(--color-dim)] transition-colors hover:text-[var(--color-ink)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/hire"
          className="mono rounded-sm border border-[var(--color-blue)] px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[var(--color-blue)] transition-all hover:bg-[var(--color-blue)] hover:text-[var(--color-void)] md:hidden"
        >
          HIRE
        </Link>
      </div>
    </header>
  );
}
