import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const metadata = { title: "Request received · Linework Studio" };

export default function ThanksPage() {
  return (
    <main className="grid-blueprint flex min-h-screen flex-col">
      <Nav />
      <section className="container-studio flex flex-1 flex-col items-center justify-center py-24 text-center">
        <div className="mono text-[11px] tracking-[0.24em] text-[var(--color-amber)]">REQUEST RECEIVED</div>
        <h1 className="mt-5 max-w-[18ch] text-[clamp(2rem,5vw,3.4rem)]">Your brief is in. Talk soon.</h1>
        <p className="mt-5 max-w-[44ch] text-[var(--color-dim)]">
          Jasmine will review the details and follow up with a quote — usually the same day. Thank you
          for choosing the studio.
        </p>
        <div className="mt-9 flex gap-4">
          <Link href="/" className="mono rounded-sm border border-[var(--color-line-2)] px-6 py-3 text-[12px] tracking-wide text-[var(--color-ink)] hover:border-[var(--color-blue)]">← HOME</Link>
          <Link href="/studio" className="mono rounded-sm bg-[var(--color-blue)] px-6 py-3 text-[12px] font-bold tracking-wide text-[var(--color-void)]">ENTER STUDIO →</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
