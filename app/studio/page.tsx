import Link from "next/link";
import { StudioShell } from "@/components/studio/StudioShell";
import { STUDIO, TOOLS, ACCENT_VAR } from "@/lib/brand";

export const metadata = { title: "Studio · Linework" };

export default function StudioHome() {
  return (
    <StudioShell>
      <div className="container-studio py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-line)] pb-8">
          <div>
            <p className="eyebrow">Studio OS · {STUDIO.principal}</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)]">Good morning. What are we shipping?</h1>
          </div>
          <div className="mono text-right text-[11px] leading-relaxed text-[var(--color-faint)]">
            <div>CONTRACT · 15QJ-131</div>
            <div>REGION · {STUDIO.region}</div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={t.href}
              className="group relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-panel)] p-8 transition-transform hover:-translate-y-1"
              style={{ ["--accent" as string]: ACCENT_VAR[t.accent] }}
            >
              <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: ACCENT_VAR[t.accent] }} />
              <div className="flex items-center justify-between">
                <span className="mono text-[11px] tracking-[0.18em]" style={{ color: ACCENT_VAR[t.accent] }}>{t.code}</span>
                <span className="mono rounded-sm border border-[var(--color-line-2)] px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--color-good)]">
                  {t.status}
                </span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold">{t.name}</h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-dim)]">{t.blurb}</p>
              <span className="mono mt-6 block text-[11px] font-semibold tracking-wide" style={{ color: ACCENT_VAR[t.accent] }}>
                OPEN TOOL →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["The loop", "Capture → compile → review → deliver. Judgment stays with you; the studio does the assembly."],
            ["Editable output", "Reports export as Word, dossiers as PDF/Word. Nothing locks you out of your own deliverables."],
            ["Grows with demand", "Every part is a door into the same studio. Prove the loop, then layer on the portal and library."],
          ].map(([h, p]) => (
            <div key={h} className="border border-[var(--color-line)] bg-[var(--color-carbon)] p-6">
              <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{h}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-dim)]">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
