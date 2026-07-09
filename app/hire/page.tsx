import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { IntakeForm } from "@/components/hire/IntakeForm";

export const metadata = { title: "Start a Project · Linework Studio" };

const STEPS = [
  ["Send the brief", "Dimensions, a sketch, a deadline — whatever you have."],
  ["Get a quote", "It arrives organized and quotable, usually same day."],
  ["Receive drawings", "Editable, professional CAD deliverables — drafted by JJ."],
];

export default function HirePage() {
  return (
    <main className="grid-blueprint min-h-screen">
      <Nav />
      <section className="border-b border-[var(--color-line)]">
        <div className="container-studio grid gap-12 py-16 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow" style={{ color: "var(--color-amber)" }}>WS-02 · Client Intake</p>
            <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.4rem)]">Have something that needs drawing up?</h1>
            <p className="mt-5 max-w-[46ch] text-[var(--color-dim)]">
              Skip the freelance marketplaces. Send it straight to the studio and it lands as a clean,
              organized brief — ready to quote, not a rambling text thread.
            </p>
            <ol className="mt-10 space-y-5">
              {STEPS.map(([h, p], i) => (
                <li key={h} className="flex gap-4">
                  <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[var(--color-amber)] text-[13px] font-bold text-[var(--color-amber)]">{i + 1}</span>
                  <div>
                    <div className="font-semibold text-[var(--color-ink)]">{h}</div>
                    <div className="text-[13.5px] text-[var(--color-dim)]">{p}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <IntakeForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
