import { STUDIO } from "@/lib/brand";
import { Reveal } from "@/components/site/Reveal";

// The vellum sheet: Jasmine's own phrase — "Inspired Design" — rendered as a
// drawing sheet. The one bright section in a dark site; inspiration literally
// on the drafting paper, with a real title block.
export function Manifesto() {
  return (
    <section id="ethos" className="vellum relative border-y border-[var(--color-line)]">
      <Reveal>
        <div className="container-studio py-24 md:py-32">
          <div className="rv eyebrow">The ethos · in her words</div>

          <h2 className="rv rv-d1 serif mt-8 max-w-[19ch] text-[clamp(2.2rem,5.5vw,4.6rem)] font-medium leading-[1.06] text-[var(--color-paper-ink)]">
            Inspired <em className="italic text-[var(--color-blue-deep)]">design</em>,
            drafted <span className="whitespace-nowrap">true.</span>
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <p className="rv rv-d2 max-w-[58ch] text-[17px] leading-relaxed text-[var(--color-paper-dim)]">
              Inspiration is where every drawing starts — a sketch on a napkin, a hillside parcel,
              a client describing the thing they can almost see. The studio's craft is carrying that
              spark through datum and dimension until it stands up to a plan checker, a contractor,
              and the field itself. <span className="font-medium text-[var(--color-paper-ink)]">Inspired is how it begins.
              Drafted true is how it ships.</span>
            </p>
            <ul className="rv rv-d3 space-y-3 border-l-2 border-[var(--color-blue-deep)] pl-6">
              {[
                "Every line placed on purpose",
                "Field-verified, not assumed",
                "Editable deliverables, always yours",
                "Faith in the work — Amos 7:7",
              ].map((li) => (
                <li key={li} className="flex items-baseline gap-3 text-[15px] text-[var(--color-paper-ink)]">
                  <span className="mono text-[10px] text-[var(--color-blue-deep)]">—</span> {li}
                </li>
              ))}
            </ul>
          </div>

          {/* drawing-sheet title block */}
          <div className="rv rv-d4 mono mt-16 grid max-w-[560px] grid-cols-3 border border-[var(--color-paper-ink)] text-[10px] uppercase tracking-[0.14em]">
            {[
              ["Sheet", "E-01 · Ethos"],
              ["Drawn by", "J. Johnson, CE"],
              ["Checked", "Field & Faith"],
              ["Scale", "1:1 · No shortcuts"],
              ["Studio", STUDIO.shortName],
              ["Stamp", "Drafted by JJ"],
            ].map(([k, v]) => (
              <div key={k} className="border border-[var(--color-paper-line)] px-3 py-2.5">
                <div className="text-[8.5px] text-[var(--color-paper-dim)]">{k}</div>
                <div className="mt-0.5 text-[10.5px] font-semibold text-[var(--color-paper-ink)]">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
