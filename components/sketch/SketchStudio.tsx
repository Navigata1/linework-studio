"use client";
import { useMemo, useRef, useState } from "react";
import { Area } from "@/components/ui/Field";
import { downscaleToDataUrl } from "@/lib/image";
import { planToDxf } from "@/lib/sketch/dxf";
import { SAMPLE_PLAN, DEFAULT_WALL_T, type PlanSpec, type LoopReport, type SketchResult } from "@/lib/sketch/types";

const STAGES = [
  ["draft", "DRAFT", "Vision extracts walls, openings, labels from the photo"],
  ["judge", "JUDGE", "A critic refactors the geometry against the validator's findings"],
  ["audit", "AUDIT", "Final coherence pass — closure, dimensions, solidification"],
] as const;

export function SketchStudio() {
  const [img, setImg] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SketchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ingest = async (f?: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setImg(await downscaleToDataUrl(f, 1280, 0.82));
    setResult(null);
    setError(null);
  };

  const run = async () => {
    if (!img || running) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: img, notes }),
      });
      const json = (await res.json()) as SketchResult;
      if (!res.ok || json.error === "draft_failed") {
        setError("The pipeline couldn't read a plan from this photo. Try a straighter, better-lit shot — or add overall dimensions in the notes.");
      } else if (json.ai === false) {
        setError("AI drafting is offline (no key configured). Load the sample plan below to explore the pipeline, preview, and DXF export.");
      } else {
        setResult(json);
      }
    } catch {
      setError("Something interrupted the pipeline. Check your connection and try again.");
    }
    setRunning(false);
  };

  const loadSample = () => {
    setResult({ ai: false, spec: SAMPLE_PLAN, loops: [{ stage: "draft", summary: "Sample plan loaded — no AI passes were run.", issues: [] }] });
    setError(null);
  };

  const downloadDxf = () => {
    if (!result?.spec) return;
    const dxf = planToDxf(result.spec);
    const blob = new Blob([dxf], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(result.spec.name ?? "floor-plan").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
      {/* LEFT — input */}
      <div className="space-y-6">
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); ingest(e.dataTransfer.files?.[0]); }}
          className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-[var(--color-line-2)] bg-[var(--color-panel)] p-6 text-center transition-colors hover:border-[var(--color-blue)]"
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="Sketch to convert" className="max-h-[260px] rounded-sm" />
          ) : (
            <>
              <span className="mono text-[12px] tracking-wide text-[var(--color-ink)]">Drop the sketch photo</span>
              <span className="text-[13px] text-[var(--color-dim)]">Napkin sketch, red-lined print, whiteboard, field notes — one clear photo.</span>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => ingest(e.target.files?.[0])} />
        </div>

        <div>
          <Area
            label="Notes for the pipeline (optional — dimensions help a lot)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={'e.g. "Garage conversion, overall 24\' × 20\'. Door on the south wall, two windows north. Interior bath in the NE corner."'}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={run}
            disabled={!img || running}
            className="mono rounded-sm bg-[var(--color-blue)] px-6 py-3 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          >
            {running ? "RUNNING 3-LOOP PIPELINE…" : "EXTRACT → JUDGE → AUDIT"}
          </button>
          <button onClick={loadSample} className="mono text-[11px] tracking-wide text-[var(--color-dim)] hover:text-[var(--color-blue)]">
            LOAD SAMPLE PLAN
          </button>
        </div>

        {/* pipeline stations */}
        <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)]">
          {STAGES.map(([key, name, desc], i) => {
            const report = result?.loops.find((l) => l.stage === key);
            const state = running ? "run" : report ? "done" : "idle";
            return (
              <div key={key} className="flex items-start gap-4 bg-[var(--color-panel)] p-4">
                <span
                  className="mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border text-[11px] font-bold"
                  style={{
                    borderColor: state === "idle" ? "var(--color-line-2)" : "var(--color-blue)",
                    color: state === "idle" ? "var(--color-faint)" : "var(--color-blue)",
                    animation: state === "run" ? "pulse 1.2s ease-in-out infinite" : undefined,
                    animationDelay: state === "run" ? `${i * 0.35}s` : undefined,
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="mono text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)]">LOOP {i + 1} · {name}</div>
                  <div className="mt-0.5 text-[12.5px] text-[var(--color-dim)]">{report ? report.summary : desc}</div>
                  {report && report.issues.some((x) => x.severity === "warn") && (
                    <ul className="mt-1.5 space-y-0.5">
                      {report.issues.filter((x) => x.severity === "warn").slice(0, 4).map((x, j) => (
                        <li key={j} className="mono text-[10.5px] text-[var(--color-amber)]">⚠ {x.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="border-l-2 border-[var(--color-amber)] bg-[var(--color-panel-2)] p-3 text-[13px] text-[var(--color-ink)]">{error}</p>}
      </div>

      {/* RIGHT — preview + export */}
      <div className="space-y-4">
        <div className="rounded-sm border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
          <div className="flex items-center justify-between">
            <span className="mono text-[11px] tracking-[0.14em] text-[var(--color-faint)]">LINEWORK PREVIEW</span>
            {result?.spec && (
              <span className="mono text-[11px] text-[var(--color-dim)]">
                {result.spec.walls.length} walls · {result.spec.openings.length} openings
              </span>
            )}
          </div>
          <div className="mt-3 aspect-[4/3] w-full">
            {result?.spec ? <PlanSvg spec={result.spec} /> : (
              <div className="flex h-full items-center justify-center text-[13px] text-[var(--color-faint)]">
                The extracted plan renders here — walls, doors, windows, labels, dims.
              </div>
            )}
          </div>
        </div>

        {result?.spec && (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={downloadDxf}
                className="mono rounded-sm bg-[var(--color-amber)] px-6 py-3 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform hover:-translate-y-0.5"
              >
                DOWNLOAD .DXF →
              </button>
              <span className="mono text-[10.5px] tracking-wide text-[var(--color-faint)]">
                R12 ASCII · layers A-WALL / A-DOOR / A-GLAZ / A-ANNO / A-DIMS · opens native in AutoCAD
              </span>
            </div>
            {(result.spec.notes?.length ?? 0) > 0 && (
              <div className="rounded-sm border border-[var(--color-line)] bg-[var(--color-panel-2)] p-4">
                <div className="mono text-[10.5px] tracking-[0.14em] text-[var(--color-faint)]">PIPELINE ASSUMPTIONS — VERIFY BEFORE RELEASE</div>
                <ul className="mt-2 space-y-1">
                  {result.spec.notes!.map((n, i) => (
                    <li key={i} className="text-[12.5px] text-[var(--color-dim)]">· {n}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Lightweight SVG rendering of the PlanSpec — same geometry the DXF ships. */
function PlanSvg({ spec }: { spec: PlanSpec }) {
  const view = useMemo(() => {
    const xs = spec.walls.flatMap((w) => [w.a[0], w.b[0]]);
    const ys = spec.walls.flatMap((w) => [w.a[1], w.b[1]]);
    if (!xs.length) return { x: 0, y: 0, w: 10, h: 10 };
    const pad = 3;
    const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
    const y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }, [spec]);

  // Plan Y is up; SVG Y is down — flip via transform.
  const flip = `translate(0 ${view.y * 2 + view.h}) scale(1 -1)`;
  const sw = Math.max(view.w, view.h) / 260; // hairline relative to extents

  return (
    <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className="h-full w-full" role="img" aria-label={spec.name ?? "Floor plan preview"}>
      <g transform={flip}>
        {spec.walls.map((w, i) => {
          const t = w.t ?? DEFAULT_WALL_T;
          const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
          if (len < 0.01) return null;
          const ux = (w.b[0] - w.a[0]) / len, uy = (w.b[1] - w.a[1]) / len;
          const cuts = spec.openings.filter((o) => o.wall === i).map((o) => [o.at - o.w / 2, o.at + o.w / 2] as [number, number]).sort((a, b) => a[0] - b[0]);
          const segs: [number, number][] = [];
          let cur = 0;
          for (const [s0, s1] of cuts) { if (s0 > cur + 0.01) segs.push([cur, s0]); cur = Math.max(cur, s1); }
          if (cur < len - 0.01) segs.push([cur, len]);
          if (!segs.length) segs.push([0, len]);
          return segs.map(([s0, s1], j) => (
            <line
              key={`${i}-${j}`}
              x1={w.a[0] + ux * s0} y1={w.a[1] + uy * s0}
              x2={w.a[0] + ux * s1} y2={w.a[1] + uy * s1}
              stroke="var(--color-ink)" strokeWidth={t} strokeLinecap="butt"
            />
          ));
        })}
        {spec.openings.map((o, i) => {
          const w = spec.walls[o.wall];
          if (!w) return null;
          const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
          const ux = (w.b[0] - w.a[0]) / len, uy = (w.b[1] - w.a[1]) / len;
          const nx = -uy, ny = ux;
          const c = [w.a[0] + ux * o.at, w.a[1] + uy * o.at];
          const h0 = [c[0] - ux * (o.w / 2), c[1] - uy * (o.w / 2)];
          if (o.type === "door") {
            const side = o.swing === "right" ? -1 : 1;
            const leaf = [h0[0] + nx * o.w * side, h0[1] + ny * o.w * side];
            const tip = [c[0] + ux * (o.w / 2), c[1] + uy * (o.w / 2)];
            return (
              <g key={i} stroke="var(--color-cyan, #38bdf8)" strokeWidth={sw * 1.4} fill="none">
                <line x1={h0[0]} y1={h0[1]} x2={leaf[0]} y2={leaf[1]} />
                <path d={`M ${leaf[0]} ${leaf[1]} A ${o.w} ${o.w} 0 0 ${side === 1 ? 0 : 1} ${tip[0]} ${tip[1]}`} strokeDasharray={`${sw * 3} ${sw * 3}`} />
              </g>
            );
          }
          if (o.type === "window") {
            const h1 = [c[0] + ux * (o.w / 2), c[1] + uy * (o.w / 2)];
            return <line key={i} x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]} stroke="var(--color-blue)" strokeWidth={sw * 2.4} />;
          }
          return null;
        })}
      </g>
      {spec.labels.map((l, i) => (
        <text
          key={i}
          x={l.at[0]}
          y={view.y * 2 + view.h - l.at[1]}
          fill="var(--color-dim)"
          fontSize={Math.max(view.w, view.h) / 34}
          textAnchor="middle"
          fontFamily="var(--font-mono, monospace)"
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}
