import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { HeroBlueprint } from "@/components/site/HeroBlueprint";
import { LineworkMark, DraftedMark } from "@/components/brand/Logo";
import { STUDIO, TOOLS, ACCENT_VAR } from "@/lib/brand";

export default function Home() {
  return (
    <main className="grid-blueprint min-h-screen">
      <Nav />

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <HeroBlueprint />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent,var(--color-void)_75%)]" />
        <div className="container-studio relative py-28 md:py-40">
          <p className="eyebrow rise rise-1">{STUDIO.principal} · Civil Engineer</p>
          <h1 className="rise rise-2 mt-5 max-w-[16ch] text-[clamp(2.6rem,7vw,6rem)] leading-[0.95]">
            Field to finish.
            <br />
            <span className="text-[var(--color-blue)] text-glow">Every line</span> accounted for.
          </h1>
          <p className="rise rise-3 mt-7 max-w-[52ch] text-[var(--color-dim)] text-[clamp(1rem,1.4vw,1.2rem)]">
            A Southern California CAD & inspection studio — and the operating system that runs it.
            Site photos become reports. Sketches become drawings. Addresses become dossiers.
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
              ["Client intake", "on her terms"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-faint)]">{k}</div>
                <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TOOLS ───────── */}
      <section id="tools" className="relative border-b border-[var(--color-line)] py-24">
        <div className="container-studio">
          <div className="flex items-end justify-between gap-6 border-b border-[var(--color-line)] pb-6">
            <div>
              <p className="eyebrow">The Studio · three instruments</p>
              <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">One login. The whole workflow.</h2>
            </div>
            <Link href="/studio" className="mono hidden text-[12px] tracking-wide text-[var(--color-blue)] hover:underline md:block">
              OPEN STUDIO →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TOOLS.map((t, i) => (
              <Link
                key={t.slug}
                href={t.href}
                className="group relative flex flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-panel)] p-7 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_60%,var(--color-line))]"
                style={{ ["--accent" as string]: ACCENT_VAR[t.accent] }}
              >
                <div className="grid-fine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <span className="mono text-[11px] tracking-[0.18em]" style={{ color: ACCENT_VAR[t.accent] }}>
                    {t.code}
                  </span>
                  <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-faint)]">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                </div>
                <h3 className="relative mt-6 text-2xl font-semibold">{t.name}</h3>
                <p className="relative mt-3 flex-1 text-[14px] leading-relaxed text-[var(--color-dim)]">{t.blurb}</p>
                <span
                  className="relative mt-6 mono text-[11px] font-semibold tracking-wide transition-colors"
                  style={{ color: ACCENT_VAR[t.accent] }}
                >
                  OPEN →
                </span>
                <span
                  className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                  style={{ background: ACCENT_VAR[t.accent] }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PROCESS ───────── */}
      <section id="work" className="border-b border-[var(--color-line)] py-24">
        <div className="container-studio">
          <p className="eyebrow">How the studio works</p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(1.8rem,3.5vw,2.8rem)]">
            The tedious half of the job, engineered away.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-4">
            {[
              ["01", "Capture", "Photos, sketches, an address. Whatever the field hands you."],
              ["02", "Compile", "EXIF, AI drafting, county records — the studio does the assembly."],
              ["03", "Review", "You correct, refine, approve. Judgment stays with the engineer."],
              ["04", "Deliver", "Editable Word docs, cited dossiers, quotable briefs. Client-ready."],
            ].map(([n, h, p]) => (
              <div key={n} className="bg-[var(--color-panel)] p-7">
                <span className="mono text-[13px] font-bold text-[var(--color-blue)]">{n}</span>
                <h3 className="mt-4 text-lg font-semibold">{h}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-dim)]">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── BRAND OPTIONS ───────── */}
      <section id="brand" className="border-b border-[var(--color-line)] py-24">
        <div className="container-studio">
          <p className="eyebrow">Identity · two directions</p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">The name on the door.</h2>
          <p className="mt-4 max-w-[58ch] text-[var(--color-dim)]">
            Two registered-ready directions. One becomes the studio; the other rides along as the
            signature stamped on every drawing.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="panel relative overflow-hidden p-8">
              <span className="absolute right-5 top-5 mono text-[10px] tracking-wide text-[var(--color-good)]">✓ AVAILABLE · $11.25/yr</span>
              <LineworkMark size={52} />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">
                Linework<span className="text-[var(--color-blue)]"> Studio</span>
              </h3>
              <p className="mono mt-1 text-[12px] text-[var(--color-dim)]">jasminelineworks.com</p>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-dim)]">
                "Linework" is the drafter's own word for the lines that make a drawing.
                Her name plus her craft in one term. Reads like a studio, scales past freelancing.
              </p>
              <div className="mt-6 flex gap-2">
                <span className="h-6 w-6 rounded-sm" style={{ background: "var(--color-blue)" }} />
                <span className="h-6 w-6 rounded-sm" style={{ background: "var(--color-cyan)" }} />
                <span className="h-6 w-6 rounded-sm" style={{ background: "var(--color-ink)" }} />
                <span className="h-6 w-6 rounded-sm border border-[var(--color-line-2)]" style={{ background: "var(--color-void)" }} />
              </div>
            </div>
            <div className="panel relative overflow-hidden p-8">
              <span className="absolute right-5 top-5 mono text-[10px] tracking-wide text-[var(--color-good)]">✓ AVAILABLE · $11.25/yr</span>
              <DraftedMark size={52} />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">
                drafted<span className="text-[var(--color-amber)]">by</span>jj
              </h3>
              <p className="mono mt-1 text-[12px] text-[var(--color-dim)]">draftedbyjj.com</p>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-dim)]">
                Warm, personal, memorable. Every deliverable is literally "drafted by JJ" — and it
                doubles as a title-block signature mark on the drawings themselves.
              </p>
              <div className="mt-6 flex gap-2">
                <span className="h-6 w-6 rounded-sm" style={{ background: "var(--color-amber)" }} />
                <span className="h-6 w-6 rounded-sm" style={{ background: "var(--color-amber-soft)" }} />
                <span className="h-6 w-6 rounded-sm" style={{ background: "var(--color-ink)" }} />
                <span className="h-6 w-6 rounded-sm border border-[var(--color-line-2)]" style={{ background: "var(--color-carbon)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="relative overflow-hidden py-28">
        <div className="grid-fine pointer-events-none absolute inset-0 opacity-40" />
        <div className="container-studio relative text-center">
          <h2 className="mx-auto max-w-[18ch] text-[clamp(2rem,4.5vw,3.6rem)]">
            Have something that needs drawing up?
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[var(--color-dim)]">
            Send the dimensions, a sketch, a photo, a deadline. It arrives as a clean, quotable brief —
            not a rambling text thread.
          </p>
          <Link
            href="/hire"
            className="mono mt-9 inline-block rounded-sm bg-[var(--color-amber)] px-8 py-4 text-[13px] font-bold tracking-wide text-[var(--color-void)] transition-transform hover:-translate-y-0.5"
          >
            START A PROJECT →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
