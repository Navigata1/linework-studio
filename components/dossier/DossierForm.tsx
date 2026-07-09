"use client";
import { useState } from "react";
import { Field, Label } from "@/components/ui/Field";
import { CA_COUNTIES } from "@/lib/counties";

type Dossier = {
  query: string;
  county: string | null;
  generatedNote: string;
  aiSummary: string | null;
  fields: { label: string; value: string }[];
  sources: { label: string; url: string; note?: string }[];
  checklist: string[];
};

export function DossierForm() {
  const [address, setAddress] = useState("");
  const [apn, setApn] = useState("");
  const [county, setCounty] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Dossier | null>(null);

  const run = async () => {
    if (!address && !apn) return;
    setBusy(true);
    try {
      const res = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, apn, county }),
      });
      setData(await res.json());
    } catch {
      alert("Lookup failed. Try again.");
    }
    setBusy(false);
  };

  const download = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, apn, county, format: "docx" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Site_Dossier.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setBusy(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <section className="h-fit border border-[var(--color-line)] bg-[var(--color-panel)] p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Lookup</h2>
        <div className="mt-5 space-y-3">
          <Field label="Site Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="1200 Main St, Riverside, CA" />
          <Field label="APN (optional)" value={apn} onChange={(e) => setApn(e.target.value)} placeholder="123-456-789" />
          <label className="block">
            <Label>County (optional)</Label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-3 py-2.5 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
            >
              <option value="">Auto-detect</option>
              {CA_COUNTIES.map((c) => (
                <option key={c.county} value={c.county}>{c.county}</option>
              ))}
            </select>
          </label>
          <button
            onClick={run}
            disabled={busy || (!address && !apn)}
            className="mono w-full rounded-sm bg-[var(--color-cyan)] px-5 py-3 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          >
            {busy ? "COMPILING…" : "COMPILE DOSSIER →"}
          </button>
        </div>
      </section>

      <section className="min-h-[300px]">
        {!data && (
          <div className="grid-fine flex h-full min-h-[300px] flex-col items-center justify-center border border-dashed border-[var(--color-line-2)] p-10 text-center">
            <p className="max-w-[40ch] text-[var(--color-dim)]">
              Enter an address or APN. The studio compiles jurisdiction, record sources, a research
              brief, and a field checklist — ready to file in the project folder.
            </p>
          </div>
        )}
        {data && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] pb-4">
              <div>
                <p className="eyebrow" style={{ color: "var(--color-cyan)" }}>Dossier · {data.county ? `${data.county} County` : "jurisdiction TBD"}</p>
                <h2 className="mt-1 text-xl font-semibold">{data.query}</h2>
              </div>
              <button onClick={download} disabled={busy} className="mono rounded-sm border border-[var(--color-cyan)] px-4 py-2 text-[11px] font-semibold tracking-wide text-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-[var(--color-void)]">
                DOWNLOAD WORD ↓
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {data.fields.map((f) => (
                <div key={f.label} className="border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
                  <div className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-faint)]">{f.label}</div>
                  <div className="mt-0.5 text-[14px] text-[var(--color-ink)]">{f.value}</div>
                </div>
              ))}
            </div>

            {data.aiSummary && (
              <div className="border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                <h3 className="mono text-[11px] tracking-[0.16em] text-[var(--color-cyan)]">RESEARCH BRIEF</h3>
                <div className="mt-3 space-y-1.5 text-[13.5px] leading-relaxed text-[var(--color-dim)]">
                  {data.aiSummary.split("\n").filter(Boolean).map((l, i) => (
                    <p key={i}>{l.replace(/^[-*]\s*/, "› ")}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mono text-[11px] tracking-[0.16em] text-[var(--color-cyan)]">RECORD SOURCES</h3>
              <div className="mt-3 space-y-2">
                {data.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-baseline justify-between gap-4 border border-[var(--color-line)] bg-[var(--color-carbon)] px-4 py-3 transition-colors hover:border-[var(--color-cyan)]">
                    <span className="text-[14px] text-[var(--color-ink)]">{s.label}</span>
                    {s.note && <span className="hidden text-[12px] text-[var(--color-faint)] sm:block">{s.note}</span>}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mono text-[11px] tracking-[0.16em] text-[var(--color-cyan)]">FIELD CHECKLIST</h3>
              <ul className="mt-3 space-y-1.5">
                {data.checklist.map((c) => (
                  <li key={c} className="flex gap-2 text-[13.5px] text-[var(--color-dim)]">
                    <span className="text-[var(--color-cyan)]">☐</span> {c}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mono text-[10px] leading-relaxed text-[var(--color-faint)]">{data.generatedNote}</p>
          </div>
        )}
      </section>
    </div>
  );
}
