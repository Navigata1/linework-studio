"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Area, Label } from "@/components/ui/Field";

const PROJECT_TYPES = [
  "Floor plan from sketch",
  "As-built drawing",
  "Site plan / exhibit",
  "PDF to DWG conversion",
  "Grading / civil detail",
  "Other",
];

export function IntakeForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: PROJECT_TYPES[0],
    dimensions: "",
    deadline: "",
    budget: "",
    description: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.email || !f.description) return;
    setBusy(true);
    try {
      await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      router.push("/hire/thanks");
    } catch {
      setBusy(false);
      alert("Something went wrong — please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 border border-[var(--color-line)] bg-[var(--color-panel)] p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name *" value={f.name} onChange={(e) => set("name", e.target.value)} required />
        <Field label="Email *" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        <label className="block">
          <Label>Project type</Label>
          <select
            value={f.projectType}
            onChange={(e) => set("projectType", e.target.value)}
            className="w-full rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-3 py-2.5 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-amber)]"
          >
            {PROJECT_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Approx. dimensions" value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="40' × 60'" />
        <Field label="Deadline" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} placeholder="2 weeks" />
        <Field label="Budget band" value={f.budget} onChange={(e) => set("budget", e.target.value)} placeholder="$300–500" />
      </div>
      <Area label="Describe the job * — what do you need drawn?" value={f.description} onChange={(e) => set("description", e.target.value)} required placeholder="A napkin sketch of a garage addition I need turned into a permit-ready floor plan…" />
      <div className="mt-1 flex items-center justify-between gap-4">
        <p className="text-[12px] text-[var(--color-faint)]">Every request arrives as a clean, quotable brief. No account needed.</p>
        <button
          type="submit"
          disabled={busy}
          className="mono rounded-sm bg-[var(--color-amber)] px-6 py-3 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
        >
          {busy ? "SENDING…" : "SEND REQUEST →"}
        </button>
      </div>
    </form>
  );
}
