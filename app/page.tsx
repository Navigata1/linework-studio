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
import { BrainLoftMark, DraftedMark } from "@/components/brand/Logo";
import { STUDIO, TOOLS, SERVICES, ACCENT_VAR } from "@/lib/brand";

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
            A California CAD &amp; inspection studio — NorCal field, SoCal roots — and the operating system that runs it.
            Sketches become drawings. Site photos become reports. Addresses become dossiers.
          </p>
          <div className="rise rise-4 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/hire"
              className="mono rounded-sm bg-[var(--color-blue)] px-6 py-3.5 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform hover:-translate-y-0.5"
            >
              START A PROJECT →
            </Link>
            <Link
              href="/studio"
              className="mono rounded-sm border border-[var(--color-line-2)] px-6 py-3.5 text-[12px] font-semibold tracking-wide text-[var(--color-ink)] transition-colors hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
            >
              ENTER THE STUDIO
            </Link>
          </div>
          <div className="rise rise-5 mt-14 flex flex-wrap gap-x-10 gap-y-3">
            {[
              ["Report prep", "cut in half"],
              ["Site research", "2 days → minutes"],
              ["Deliverables", "always editable"],
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
            PRICING SHOWN AS STARTING BANDS · EVERY JOB QUOTED EXACTLY BEFORE WORK BEGINS
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

      {/* ───────── THE STUDIO OS ───────── */}
      <section id="tools" className="border-b border-[var(--color-line)] py-24 md:py-28">
        <Reveal className="container-studio">
          <div className="flex items-end justify-between gap-6 border-b border-[var(--color-line)] pb-6">
            <div>
              <p className="rv eyebrow">The Studio OS · three instruments</p>
              <h2 className="rv rv-d1 mt-3 text-[clamp(1.9rem,3.8vw,3rem)]">One login. The whole workflow.</h2>
            </div>
            <Link href="/studio" className="rv mono sweep hidden text-[12px] tracking-wide text-[var(--color-blue)] md:block">
              OPEN STUDIO →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TOOLS.map((t, i) => (
              <div key={t.slug} className={`rv rv-d${i + 1}`}>
                <LilyPad bobDelay={`${i * 2.3}s`} maxTilt={7}>
                  <Link
                    href={t.href}
                    className="glass glass-spec backdrop-blur-2xl backdrop-saturate-150 group flex h-full flex-col p-7"
                    style={{ ["--accent" as string]: ACCENT_VAR[t.accent] }}
                  >
                    <div className="relative flex items-center justify-between">
                      <span className="mono text-[11px] tracking-[0.18em]" style={{ color: ACCENT_VAR[t.accent] }}>{t.code}</span>
                      <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-faint)]">{String(i + 1).padStart(2, "0")} / 03</span>
                    </div>
                    <h3 className="relative mt-6 text-2xl font-semibold">{t.name}</h3>
                    <p className="relative mt-3 flex-1 text-[14px] leading-relaxed text-[var(--color-dim)]">{t.blurb}</p>
                    <span className="relative mt-6 mono text-[11px] font-semibold tracking-wide" style={{ color: ACCENT_VAR[t.accent] }}>OPEN →</span>
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full" style={{ background: ACCENT_VAR[t.accent] }} />
                  </Link>
                </LilyPad>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ───────── PROCESS ───────── */}
      <section id="process" className="border-b border-[var(--color-line)] py-24">
        <Reveal className="container-studio">
          <p className="rv eyebrow">How the studio works</p>
          <h2 className="rv rv-d1 mt-3 max-w-[22ch] text-[clamp(1.9rem,3.8vw,3rem)]">
            The tedious half of the job, <span className="serif italic">engineered away</span>.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-4">
            {[
              ["01", "Capture", "Photos, sketches, an address. Whatever the field hands you."],
              ["02", "Compile", "EXIF, AI drafting, county records — the studio does the assembly."],
              ["03", "Review", "You correct, refine, approve. Judgment stays with the engineer."],
              ["04", "Deliver", "Editable Word docs, cited dossiers, quotable briefs. Client-ready."],
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

      {/* ───────── IDENTITY ───────── */}
      <section id="brand" className="border-b border-[var(--color-line)] py-24">
        <Reveal className="container-studio">
          <p className="rv eyebrow">Identity · one studio, two marks</p>
          <h2 className="rv rv-d1 mt-3 text-[clamp(1.9rem,3.8vw,3rem)]">The name on the door.</h2>
          <p className="rv rv-d2 mt-4 max-w-[62ch] text-[var(--color-dim)]">
            <em className="serif italic text-[var(--color-ink)]">Inspired Design</em> is the ethos — Jasmine's own phrase, and the
            soul of the studio. <strong className="font-semibold text-[var(--color-ink)]">Brain Loft Studios</strong> is
            its name: the upstairs room where ideas are kept, turned over, and drawn true. The
            signature below stamps every sheet that leaves it.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rv rv-d2">
              <LilyPad bobDelay="0.8s" maxTilt={6}>
                <div className="glass glass-spec backdrop-blur-2xl backdrop-saturate-150 relative p-8">
                  <span className="absolute right-5 top-5 mono text-[10px] tracking-wide text-[var(--color-good)]">✓ AVAILABLE · $11.25/YR</span>
                  <BrainLoftMark size={52} />
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">
                    Brain<span className="text-[var(--color-blue)]">Loft</span> Studios
                  </h3>
                  <p className="mono mt-1 text-[12px] text-[var(--color-dim)]">brainloftstudios.com</p>
                  <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-dim)]">
                    The loft is where a drafter keeps the good ideas — up a ladder, above the noise.
                    Jasmine's pick, and the roof over all three instruments of the studio.
                  </p>
                </div>
              </LilyPad>
            </div>
            <div className="rv rv-d3">
              <LilyPad bobDelay="2.6s" maxTilt={6}>
                <div className="glass glass-spec backdrop-blur-2xl backdrop-saturate-150 relative p-8">
                  <span className="absolute right-5 top-5 mono text-[10px] tracking-wide text-[var(--color-good)]">✓ AVAILABLE · $11.25/YR</span>
                  <DraftedMark size={52} />
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">
                    drafted<span className="text-[var(--color-amber)]">by</span>jj
                  </h3>
                  <p className="mono mt-1 text-[12px] text-[var(--color-dim)]">draftedbyjj.com</p>
                  <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-dim)]">
                    The signature. Warm, personal, memorable — stamped in the corner of every sheet the
                    studio ships, the way a hand signs finished work.
                  </p>
                </div>
              </LilyPad>
            </div>
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
