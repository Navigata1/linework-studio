import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { HeroPlan } from "@/components/site/HeroPlan";
import { LiquidCanvas } from "@/components/site/LiquidCanvas";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { PlumbSpine } from "@/components/site/PlumbSpine";
import { Wave } from "@/components/site/Wave";
import { Marquee } from "@/components/site/Marquee";
import { Manifesto } from "@/components/site/Manifesto";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { Reveal } from "@/components/site/Reveal";
import { LilyPad } from "@/components/ui/LilyPad";
import { STUDIO, SERVICES } from "@/lib/brand";

const STATIONS = [
  { id: "top", label: "00 · Surface" },
  { id: "ethos", label: "01 · Ethos" },
  { id: "services", label: "02 · Services" },
  { id: "work", label: "03 · The Craft" },
  { id: "tools", label: "04 · Studio" },
  { id: "process", label: "05 · Process" },
  { id: "brand", label: "06 · Identity" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <SmoothScroll />
      <LiquidCanvas />
      {/* scroll-driven scrim: keeps text legible as the cloudscape brightens */}
      <div className="depth-veil" aria-hidden />
      <PlumbSpine stations={STATIONS} />
      <div className="grid-blueprint relative z-10">
      <Nav />

      {/* ───────── HERO — the surface of the water ───────── */}
      <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-[var(--color-line)]">
        <HeroPlan />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-void)_78%,transparent)_26%,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-void)_70%,transparent))]" />
        <div className="container-studio relative w-full py-24 md:py-28">
          <p className="eyebrow rise rise-1">{STUDIO.principal} · Civil Engineer · {STUDIO.regionLine}</p>
          <h1 className="rise rise-2 mt-6 max-w-[15ch] text-[clamp(2.7rem,7.2vw,6.2rem)] leading-[0.98]">
            <span className="serif font-medium italic text-[var(--color-amber-soft)]">Inspired</span> design,
            <br />
            drafted <span className="text-[var(--color-blue)] text-glow">true</span>.
          </h1>
          <p className="rise rise-3 mt-7 max-w-[50ch] text-[clamp(1rem,1.4vw,1.2rem)] text-[var(--color-dim)]">
            A California CAD &amp; drafting studio — NorCal field, SoCal roots. Your sketch, red-line, or flat
            PDF becomes clean, editable, permit-ready CAD — drafted true and delivered fast.
          </p>
          <div className="rise rise-4 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/hire"
              className="mono rounded-sm bg-[var(--color-blue)] px-6 py-3.5 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform hover:-translate-y-0.5"
            >
              START A PROJECT →
            </Link>
            <Link
              href="/#services"
              className="mono rounded-sm border border-[var(--color-line-2)] px-6 py-3.5 text-[12px] font-semibold tracking-wide text-[var(--color-ink)] transition-colors hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
            >
              SEE SERVICES
            </Link>
          </div>
          <div className="rise rise-5 mt-14 flex flex-wrap gap-x-10 gap-y-3">
            {[
              ["Quotes", "usually same day"],
              ["Turnaround", "days, not weeks"],
              ["Deliverables", "native DWG/DXF + PDF"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-faint)]">{k}</div>
                <div className="font-[family-name:var(--font-display)] text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ───────── MANIFESTO — break the surface into the drawing sheet ───────── */}
      <Wave fill="var(--color-paper)" />
      <Manifesto />
      <Wave fill="var(--color-paper)" flip />

      {/* ───────── SERVICES ───────── */}
      <section id="services" className="border-b border-[var(--color-line)] py-24 md:py-28">
        <Reveal className="container-studio">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--color-line)] pb-6">
            <div>
              <p className="rv eyebrow" style={{ color: "var(--color-amber)" }}>Services · scoped once, priced straight</p>
              <h2 className="rv rv-d1 mt-3 text-[clamp(1.9rem,3.8vw,3rem)]">What the studio drafts.</h2>
            </div>
            <Link href="/hire" className="rv rv-d2 mono sweep hidden text-[12px] tracking-wide text-[var(--color-amber)] md:block">
              REQUEST A QUOTE →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SERVICES.map((s, i) => (
              <div key={s.no} className={`rv rv-d${(i % 4) + 1}`}>
                <LilyPad bobDelay={`${i * 1.7}s`}>
                  <Link href="/hire" className="glass glass-spec backdrop-blur-2xl backdrop-saturate-150 group block p-8">
                    <div className="flex items-baseline justify-between">
                      <span className="idx text-[var(--color-amber)]">{s.no}</span>
                      <span className="mono text-[11px] text-[var(--color-faint)]">{s.turnaround}</span>
                    </div>
                    <h3 className="mt-5 text-[22px] font-semibold transition-colors group-hover:text-[var(--color-amber-soft)]">{s.name}</h3>
                    <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-[var(--color-dim)]">{s.desc}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="serif text-[17px] italic text-[var(--color-ink)]">{s.from}</span>
                      <span className="mono text-[11px] font-semibold tracking-wide text-[var(--color-amber)] opacity-0 transition-opacity group-hover:opacity-100">
                        START →
                      </span>
                    </div>
                  </Link>
                </LilyPad>
              </div>
            ))}
          </div>
          <p className="rv mono mt-4 text-[11px] tracking-wide text-[var(--color-faint)]">
            PRICING SHOWN AS STARTING BANDS · EVERY PROJECT BEGINS WITH A QUICK CONSULT · TURNAROUND CLOCKS START ONCE
            REQUIRED INPUTS (MEASUREMENTS, SURVEY DATA, SKETCHES) ARE IN HAND
          </p>
        </Reveal>
      </section>

      {/* ───────── SKETCH → DRAFTED ───────── */}
      <section id="work" className="border-b border-[var(--color-line)] py-24 md:py-28">
        <Reveal className="container-studio">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.35fr]">
            <div>
              <p className="rv eyebrow">The craft · drag the line</p>
              <h2 className="rv rv-d1 mt-3 max-w-[16ch] text-[clamp(1.9rem,3.8vw,3rem)]">
                From napkin to <span className="serif italic text-[var(--color-cyan)]">plan-check ready</span>.
              </h2>
              <p className="rv rv-d2 mt-5 max-w-[46ch] text-[var(--color-dim)]">
                This is the studio's whole promise in one gesture: the sketch a client sends at 9pm
                on the left — the dimensioned, layered, submission-ready drawing on the right.
                Drag the plumb line and watch the translation.
              </p>
              <Link
                href="/hire"
                className="rv rv-d3 mono mt-8 inline-block rounded-sm border border-[var(--color-cyan)] px-6 py-3 text-[12px] font-semibold tracking-wide text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)] hover:text-[var(--color-void)]"
              >
                SEND YOUR SKETCH →
              </Link>
            </div>
            <div className="rv rv-d2">
              <BeforeAfter />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────── START BAND ───────── */}
      <section id="start" className="border-b border-[var(--color-line)] py-24 md:py-28">
        <Reveal className="container-studio">
          <div className="glass glass-spec backdrop-blur-2xl backdrop-saturate-150 relative overflow-hidden p-10 md:p-14">
            <p className="rv eyebrow" style={{ color: "var(--color-amber)" }}>No marketplaces · no middlemen</p>
            <h2 className="rv rv-d1 mt-3 max-w-[24ch] text-[clamp(1.9rem,3.8vw,3rem)]">
              Send whatever you have. <span className="serif italic">It comes back drawn true.</span>
            </h2>
            <p className="rv rv-d2 mt-4 max-w-[58ch] text-[var(--color-dim)]">
              A photo of a napkin sketch, a red-lined print, a flat PDF, field notes with dimensions —
              submit it with your deadline and it lands as a clean brief. A quote comes back, usually the
              same day, and the studio's own AI-assisted drafting pipeline turns it around fast without
              ever taking judgment away from the engineer.
            </p>
            <div className="rv rv-d3 mt-8 flex flex-wrap gap-4">
              <Link
                href="/hire"
                className="mono rounded-sm bg-[var(--color-amber)] px-6 py-3.5 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform hover:-translate-y-0.5"
              >
                START A PROJECT →
              </Link>
              <Link
                href="/#services"
                className="mono rounded-sm border border-[var(--color-line-2)] px-6 py-3.5 text-[12px] font-semibold tracking-wide text-[var(--color-ink)] transition-colors hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]"
              >
                BROWSE SERVICES
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────── PROCESS ───────── */}
      <section id="process" className="border-b border-[var(--color-line)] py-24">
        <Reveal className="container-studio">
          <p className="rv eyebrow">How it works</p>
          <h2 className="rv rv-d1 mt-3 max-w-[22ch] text-[clamp(1.9rem,3.8vw,3rem)]">
            Four steps from <span className="serif italic">idea to drawing</span>.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-4">
            {[
              ["01", "Send it", "A sketch photo, red-lined print, PDF, or dimensions — whatever you have."],
              ["02", "Get your quote", "A scoped, fixed quote comes back fast — usually the same day."],
              ["03", "Drafting", "Your project is drawn in AutoCAD, reviewed and quality-checked by the engineer."],
              ["04", "Delivery", "Native DWG/DXF plus PDF, layered and editable. Revisions handled in-thread."],
            ].map(([n, h, p], i) => (
              <div key={n} className={`rv rv-d${i + 1} bg-[var(--color-panel)] p-7`}>
                <span className="mono text-[13px] font-bold text-[var(--color-blue)]">{n}</span>
                <h3 className="mt-4 text-lg font-semibold">{h}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-dim)]">{p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <div className="grid-fine pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_oklab,var(--color-amber)_8%,transparent),transparent_60%)]" />
        <Reveal className="container-studio relative text-center">
          <h2 className="rv mx-auto max-w-[20ch] text-[clamp(2rem,4.6vw,3.8rem)]">
            Have something that needs <span className="serif italic text-[var(--color-amber-soft)]">drawing up</span>?
          </h2>
          <p className="rv rv-d1 mx-auto mt-5 max-w-[46ch] text-[var(--color-dim)]">
            Send the dimensions, a sketch, a photo, a deadline. It arrives as a clean, quotable
            brief — not a rambling text thread.
          </p>
          <Link
            href="/hire"
            className="rv rv-d2 mono mt-9 inline-block rounded-sm bg-[var(--color-amber)] px-8 py-4 text-[13px] font-bold tracking-wide text-[var(--color-void)] transition-transform hover:-translate-y-0.5"
          >
            START A PROJECT →
          </Link>
        </Reveal>
      </section>

      <Footer />
      </div>
    </main>
  );
}
