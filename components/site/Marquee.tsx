import { DRAFTING_TERMS } from "@/lib/brand";

// The name-candidate vocabulary, running as a plotter strip. Duplicated track
// for a seamless loop; aria-hidden because it's pure texture.
export function Marquee() {
  const run = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {DRAFTING_TERMS.map((t) => (
        <span key={`${key}-${t}`} className="flex items-center">
          <span className="mono px-6 text-[12px] uppercase tracking-[0.3em] text-[var(--color-faint)]">{t}</span>
          <span className="h-1 w-1 rotate-45 bg-[var(--color-blue)] opacity-60" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden border-y border-[var(--color-line)] bg-[var(--color-carbon)] py-3.5" aria-hidden>
      <div className="marquee-track">{run("a")}{run("b")}</div>
    </div>
  );
}
