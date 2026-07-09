import Link from "next/link";
import { STUDIO } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-carbon)]">
      <div className="container-studio flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="mono text-[11px] tracking-wide text-[var(--color-faint)]">
          <span className="text-[var(--color-dim)]">{STUDIO.name}</span> · {STUDIO.principal}, CE · {STUDIO.region}
        </div>
        <div className="flex items-center gap-5">
          <Link href="/studio" className="mono text-[11px] tracking-wide text-[var(--color-faint)] hover:text-[var(--color-blue)]">
            STUDIO
          </Link>
          <Link href="/hire" className="mono text-[11px] tracking-wide text-[var(--color-faint)] hover:text-[var(--color-blue)]">
            START A PROJECT
          </Link>
          <span className="mono text-[11px] tracking-wide text-[var(--color-faint)]">
            Built by {STUDIO.crew} 💎
          </span>
        </div>
      </div>
    </footer>
  );
}
