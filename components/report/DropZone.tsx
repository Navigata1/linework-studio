"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Field, Area, Label } from "@/components/ui/Field";
import { downscaleToDataUrl, readExif } from "@/lib/image";
import { EMPTY_META, type ReportMeta, type LogEntry, type PhotoEntry } from "@/lib/report/types";

const PRESET_KEY = "linework.report.preset";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function DropZone() {
  const [meta, setMeta] = useState<ReportMeta>(EMPTY_META);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [aiOn, setAiOn] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Restore saved header preset (set once, reused every report).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (raw) setMeta((m) => ({ ...m, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  const savePreset = useCallback(() => {
    const { reportNo, date, ...preset } = meta;
    localStorage.setItem(PRESET_KEY, JSON.stringify(preset));
    setBusy("saved");
    setTimeout(() => setBusy(null), 1200);
  }, [meta]);

  const setField = (k: keyof ReportMeta, v: string) => setMeta((m) => ({ ...m, [k]: v }));

  const ingest = useCallback(
    async (files: File[]) => {
      const imgs = files.filter((f) => f.type.startsWith("image/"));
      if (!imgs.length) return;
      setBusy(`Reading ${imgs.length} photo${imgs.length > 1 ? "s" : ""}…`);
      const startNo = photos.length;
      const entries: PhotoEntry[] = [];
      for (let i = 0; i < imgs.length; i++) {
        const file = imgs[i];
        const [dataUrl, exif] = await Promise.all([downscaleToDataUrl(file), readExif(file)]);
        entries.push({
          id: uid(),
          fileName: file.name,
          dataUrl,
          date: exif.date,
          time: exif.time,
          gps: exif.gps,
          imageNo: String(startNo + i + 1),
          activityNo: "",
          description: "",
        });
      }
      setPhotos((p) => [...p, ...entries]);

      // Draft descriptions with AI (graceful fallback server-side).
      // Small thumbnails + chunked requests keep every call well under
      // serverless body limits, no matter how many photos the day produced.
      const thumbs = await Promise.all(imgs.map((f) => downscaleToDataUrl(f, 900, 0.7)));
      const CHUNK = 3;
      for (let i = 0; i < entries.length; i += CHUNK) {
        setBusy(`Drafting descriptions… ${Math.min(i + CHUNK, entries.length)}/${entries.length}`);
        const slice = entries.slice(i, i + CHUNK).map((e, j) => ({ id: e.id, dataUrl: thumbs[i + j], hint: e.fileName }));
        try {
          const res = await fetch("/api/describe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: slice }),
          });
          const json = await res.json();
          setAiOn(Boolean(json.ai));
          setPhotos((p) => p.map((ph) => (json.descriptions?.[ph.id] ? { ...ph, description: json.descriptions[ph.id] } : ph)));
        } catch {
          setAiOn(false);
        }
      }
      setBusy(null);
    },
    [photos.length],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    ingest(Array.from(e.dataTransfer.files));
  };

  const updatePhoto = (id: string, patch: Partial<PhotoEntry>) =>
    setPhotos((p) => p.map((ph) => (ph.id === id ? { ...ph, ...patch } : ph)));
  const removePhoto = (id: string) => setPhotos((p) => p.filter((ph) => ph.id !== id));

  const addLog = () => setLog((l) => [...l, { time: "", note: "" }]);
  const setLogEntry = (i: number, patch: Partial<LogEntry>) =>
    setLog((l) => l.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const removeLog = (i: number) => setLog((l) => l.filter((_, idx) => idx !== i));

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Daily_Report_${meta.reportNo || "DRAFT"}_${meta.contractNo}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generate = async () => {
    setBusy("Assembling Word document…");
    try {
      // Build the .docx right here in the browser — a full day of photos is
      // far larger than serverless request limits allow, and it never needs
      // to leave this device to become a Word file.
      const { buildReportDocx } = await import("@/lib/report/docx");
      const blob = await buildReportDocx({ meta, log, photos });
      download(blob);
      // Record report metadata only (tiny payload, photos never sent).
      fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta, log, photos: [], photoCount: photos.length, logOnly: true }),
      }).catch(() => {});
    } catch {
      // Fallback: legacy server-side generation (small photo sets only).
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meta, log, photos }),
        });
        if (!res.ok) throw new Error("gen");
        download(await res.blob());
      } catch {
        alert("Could not generate the report on this device. Try removing a photo or refreshing — and send Jon a note so he can take a look.");
      }
    }
    setBusy(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      {/* LEFT — header + log */}
      <div className="space-y-8">
        <section className="border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Report header</h2>
            <button onClick={savePreset} className="mono text-[10px] tracking-wide text-[var(--color-blue)] hover:underline">
              {busy === "saved" ? "✓ SAVED" : "SAVE AS PRESET"}
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Field label="Contract No." value={meta.contractNo} onChange={(e) => setField("contractNo", e.target.value)} />
            <Field label="Report No." value={meta.reportNo} onChange={(e) => setField("reportNo", e.target.value)} />
            <Field label="Date" value={meta.date} onChange={(e) => setField("date", e.target.value)} placeholder="MM/DD/YYYY" />
            <Field label="Inspector" value={meta.inspector} onChange={(e) => setField("inspector", e.target.value)} />
            <Field label="Weather" value={meta.weather} onChange={(e) => setField("weather", e.target.value)} />
            <Field label="Temperature" value={meta.temperature} onChange={(e) => setField("temperature", e.target.value)} placeholder="72°F" />
            <Field label="Time Start" value={meta.timeStart} onChange={(e) => setField("timeStart", e.target.value)} placeholder="07:00" />
            <Field label="Time Finish" value={meta.timeFinish} onChange={(e) => setField("timeFinish", e.target.value)} placeholder="15:30" />
            <div className="col-span-2">
              <Field label="Project" value={meta.project} onChange={(e) => setField("project", e.target.value)} />
            </div>
            <div className="col-span-2">
              <Field label="Location" value={meta.location} onChange={(e) => setField("location", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Work log</h2>
            <button onClick={addLog} className="mono text-[10px] tracking-wide text-[var(--color-blue)] hover:underline">+ ADD ENTRY</button>
          </div>
          <div className="mt-5 space-y-2">
            {log.length === 0 && <p className="text-[13px] text-[var(--color-faint)]">Timestamped entries — the narrative of the shift.</p>}
            {log.map((e, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={e.time}
                  onChange={(ev) => setLogEntry(i, { time: ev.target.value })}
                  placeholder="08:15"
                  className="mono w-20 shrink-0 rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-2 py-2 text-[12px] text-[var(--color-blue)] outline-none focus:border-[var(--color-blue)]"
                />
                <input
                  value={e.note}
                  onChange={(ev) => setLogEntry(i, { note: ev.target.value })}
                  placeholder="Contractor begins power washing north wall."
                  className="w-full rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-blue)]"
                />
                <button onClick={() => removeLog(i)} className="shrink-0 px-2 text-[var(--color-faint)] hover:text-[var(--color-amber)]" aria-label="Remove">×</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT — photos + generate */}
      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className="grid-fine flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition-colors"
          style={{ borderColor: drag ? "var(--color-blue)" : "var(--color-line-2)", background: drag ? "color-mix(in oklab, var(--color-blue) 8%, var(--color-panel))" : "var(--color-panel)" }}
        >
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && ingest(Array.from(e.target.files))} />
          <div className="mono text-[11px] tracking-[0.2em] text-[var(--color-blue)]">DROP ZONE</div>
          <p className="mt-3 max-w-[34ch] text-[15px] text-[var(--color-ink)]">Drop the day's site photos here — or click to browse.</p>
          <p className="mt-2 text-[12px] text-[var(--color-dim)]">EXIF fills date, time & GPS · AI drafts each description</p>
          {busy && <p className="mono mt-4 text-[11px] tracking-wide text-[var(--color-amber)]">{busy}</p>}
        </div>

        {aiOn === false && photos.length > 0 && (
          <p className="mono text-[10px] tracking-wide text-[var(--color-faint)]">
            AI drafting offline — descriptions are placeholders. Add ANTHROPIC_API_KEY to enable auto-drafting.
          </p>
        )}

        <div className="space-y-3">
          {photos.map((p) => (
            <div key={p.id} className="flex gap-4 border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.dataUrl} alt={p.fileName} className="h-24 w-24 shrink-0 rounded-sm object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <input value={p.imageNo} onChange={(e) => updatePhoto(p.id, { imageNo: e.target.value })} className="mono w-12 rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-2 py-1 text-[11px] text-[var(--color-blue)] outline-none" aria-label="Image number" />
                  <input value={p.activityNo} onChange={(e) => updatePhoto(p.id, { activityNo: e.target.value })} placeholder="Act #" className="mono w-16 rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-2 py-1 text-[11px] text-[var(--color-ink)] outline-none" aria-label="Activity number" />
                  <span className="mono text-[10px] text-[var(--color-faint)]">{p.date} · {p.time}{p.gps ? " · GPS" : ""}</span>
                  <button onClick={() => removePhoto(p.id)} className="ml-auto text-[var(--color-faint)] hover:text-[var(--color-amber)]" aria-label="Remove photo">×</button>
                </div>
                <textarea
                  value={p.description}
                  onChange={(e) => updatePhoto(p.id, { description: e.target.value })}
                  placeholder="Activity description…"
                  className="mt-2 w-full resize-y rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-2.5 py-2 text-[13px] leading-relaxed text-[var(--color-ink)] outline-none focus:border-[var(--color-blue)]"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 flex items-center justify-between gap-4 border border-[var(--color-line-2)] bg-[color-mix(in_oklab,var(--color-panel-2)_94%,transparent)] p-4 backdrop-blur">
          <div className="mono text-[11px] text-[var(--color-dim)]">
            <span className="text-[var(--color-ink)]">{photos.length}</span> photos · <span className="text-[var(--color-ink)]">{log.length}</span> log
          </div>
          <button
            onClick={generate}
            disabled={!!busy || photos.length === 0}
            className="mono rounded-sm bg-[var(--color-blue)] px-6 py-3 text-[12px] font-bold tracking-wide text-[var(--color-void)] transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          >
            {busy ? "WORKING…" : "GENERATE WORD REPORT ↓"}
          </button>
        </div>
      </div>
    </div>
  );
}
