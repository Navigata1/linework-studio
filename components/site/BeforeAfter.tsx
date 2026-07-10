"use client";
import { useCallback, useRef, useState } from "react";

// Draggable sketch → CAD comparison. Left: a wobbly "napkin sketch" (pencil on
// paper). Right: the same plan drafted clean. Both are inline SVG — no assets.
// Keyboard accessible via the range input overlay.

function SketchSide() {
  return (
    <svg viewBox="0 0 520 340" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="520" height="340" fill="#efe9da" />
      {/* pencil texture lines */}
      <g stroke="#8a8474" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M84 62 C 200 54, 340 58, 442 64 C 446 140, 444 216, 440 282 C 320 288, 190 286, 86 280 C 82 210, 80 130, 84 62 Z" />
        <path d="M246 60 C 248 110, 246 150, 248 196" />
        <path d="M86 190 C 130 186, 170 190, 210 188" />
        <path d="M248 196 C 310 192, 380 196, 442 194" />
        {/* wobbly door arc */}
        <path d="M248 196 C 270 180, 282 164, 284 142" strokeDasharray="5 6" />
      </g>
      <g fill="#7a7466" fontFamily="cursive" fontSize="17" transform="rotate(-2 260 170)">
        <text x="130" y="130">living??</text>
        <text x="320" y="120">kitchen</text>
        <text x="150" y="248">garage →</text>
        <text x="330" y="252">~22 ft?</text>
      </g>
      <g stroke="#7a7466" strokeWidth="1.4" opacity="0.7">
        <path d="M300 262 L 420 262 M300 256 L300 268 M420 256 L420 268" />
      </g>
      <text x="30" y="322" fill="#8a8474" fontFamily="cursive" fontSize="15" transform="rotate(-1 30 322)">measured after church, double check!</text>
    </svg>
  );
}

function CadSide() {
  return (
    <svg viewBox="0 0 520 340" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="520" height="340" fill="var(--color-carbon)" />
      <g opacity="0.5">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={40 * i} y1="0" x2={40 * i} y2="340" stroke="var(--color-line)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={40 * i} x2="520" y2={40 * i} stroke="var(--color-line)" strokeWidth="0.5" />
        ))}
      </g>
      <g stroke="var(--color-blue)" strokeWidth="2.4" fill="none">
        <rect x="84" y="62" width="358" height="220" />
      </g>
      <g stroke="var(--color-blue)" strokeWidth="1.1" fill="none" opacity="0.95">
        <path d="M246 62 V196 M84 190 H210 M246 196 H442" />
      </g>
      <g stroke="var(--color-amber)" strokeWidth="1" fill="none">
        <path d="M246 196 A54 54 0 0 1 300 142" />
        <path d="M210 190 A40 40 0 0 1 250 150" opacity="0.7" />
      </g>
      <g stroke="var(--color-dim)" strokeWidth="0.8" opacity="0.8">
        <path d="M84 36 H442 M84 28 V44 M442 28 V44 M246 30 V42" />
        <path d="M56 62 V282 M48 62 H64 M48 282 H64" />
      </g>
      <g fill="var(--color-dim)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">
        <text x="240" y="24" textAnchor="middle">35'-10"</text>
        <text x="40" y="176" textAnchor="middle" transform="rotate(-90 40 176)">22'-0"</text>
      </g>
      <g fill="var(--color-faint)" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="3">
        <text x="130" y="140">LIVING</text>
        <text x="320" y="120">KITCHEN</text>
        <text x="150" y="250">GARAGE</text>
      </g>
      <g>
        <path d="M340 282 V246 H442" stroke="var(--color-line-2)" strokeWidth="1" fill="none" />
        <text x="352" y="268" fill="var(--color-faint)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">DRAFTED BY JJ · S-01</text>
      </g>
    </svg>
  );
}

export function BeforeAfter() {
  const [pos, setPos] = useState(52);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    const pct = Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100));
    setPos(pct);
  }, []);

  return (
    <div
      ref={trackRef}
      className="group relative aspect-[52/34] w-full cursor-ew-resize select-none overflow-hidden border border-[var(--color-line)]"
      onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); setFromClientX(e.clientX); }}
      onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* CAD underneath, sketch clipped on top */}
      <div className="absolute inset-0"><CadSide /></div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}><SketchSide /></div>

      {/* a11y slider — before the handle so peer-focus can light it up */}
      <input
        type="range"
        min={4}
        max={96}
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Reveal drafted drawing"
        className="peer absolute inset-x-0 bottom-0 h-8 w-full cursor-ew-resize opacity-0"
      />

      {/* divider handle — visibly ringed when the slider has keyboard focus */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-[2px] bg-[var(--color-amber)]" />
        <div className="absolute top-1/2 -ml-[18px] -mt-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-amber)] bg-[var(--color-void)] text-[var(--color-amber)] shadow-lg transition-shadow peer-focus-visible:[box-shadow:0_0_0_3px_var(--color-amber),0_0_18px_var(--color-amber)]" />
      </div>
      <div className="pointer-events-none absolute top-1/2 -mt-[5px] -ml-[7px]" style={{ left: `${pos}%` }}>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="text-[var(--color-amber)]"><path d="M4 1 L1 5 L4 9 M10 1 L13 5 L10 9" stroke="currentColor" strokeWidth="1.5" /></svg>
      </div>

      {/* labels */}
      <span className="mono absolute left-3 top-3 rounded-sm bg-[rgba(0,0,0,0.45)] px-2 py-1 text-[10px] tracking-[0.18em] text-[#efe9da]">CLIENT SKETCH</span>
      <span className="mono absolute right-3 top-3 rounded-sm bg-[rgba(0,0,0,0.45)] px-2 py-1 text-[10px] tracking-[0.18em] text-[var(--color-cyan)]">DRAFTED</span>
    </div>
  );
}
