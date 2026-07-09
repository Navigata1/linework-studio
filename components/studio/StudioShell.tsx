import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { TOOLS, ACCENT_VAR } from "@/lib/brand";

// Chrome for every /studio page: rail with the tool registry + a back-to-site link.
export function StudioShell({ children, active }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="grid-blueprint min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-void)_85%,transparent)] backdrop-blur-md">
        <div className="container-studio flex h-16 items-center justify-between">
          <Link href="/studio" aria-label="Studio home">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-1">
            {TOOLS.map((t) => (
              <Link
                key={t.slug}
                href={t.href}
                className="mono rounded-sm px-3 py-2 text-[11.5px] tracking-wide transition-colors"
                style={{
                  color: active === t.slug ? ACCENT_VAR[t.accent] : "var(--color-dim)",
                  background: active === t.slug ? "color-mix(in oklab, var(--color-panel-2) 100%, transparent)" : "transparent",
                }}
              >
                {t.name}
              </Link>
            ))}
            <Link href="/" className="mono ml-2 rounded-sm border border-[var(--color-line)] px-3 py-2 text-[11px] tracking-wide text-[var(--color-faint)] hover:text-[var(--color-ink)]">
              ← SITE
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
