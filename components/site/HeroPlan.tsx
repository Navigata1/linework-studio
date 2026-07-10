"use client";
import { useEffect, useRef } from "react";

// The hero visual: a floor plan that draws itself like a plotter run —
// walls, door swings, dimension strings, room labels. Subtle pointer
// parallax on desktop; fully static under prefers-reduced-motion.
export function HeroPlan() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = wrapRef.current;
    if (reduce || !el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 10;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
    };
    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 flex items-center justify-end will-change-transform">
      <svg viewBox="0 0 640 560" className="h-[110%] w-auto max-w-none opacity-[0.62] md:mr-[-4%]" fill="none" aria-hidden>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-blue)" />
            <stop offset="1" stopColor="var(--color-cyan)" />
          </linearGradient>
        </defs>

        {/* outer walls */}
        <g className="d1" stroke="url(#wall)" strokeWidth="2.4">
          <path d="M120 90 H560 V470 H120 Z" />
        </g>
        {/* interior partitions */}
        <g className="d2" stroke="var(--color-blue)" strokeWidth="1.3" opacity="0.9">
          <path d="M330 90 V260" />
          <path d="M330 320 V470" />
          <path d="M120 300 H240" />
          <path d="M300 300 H560" />
          <path d="M440 300 V470" />
        </g>
        {/* door swings */}
        <g className="d3" stroke="var(--color-amber)" strokeWidth="1.1">
          <path d="M330 260 A60 60 0 0 1 390 320" opacity="0.9" />
          <path d="M240 300 A60 60 0 0 1 300 240" opacity="0.9" />
          <path d="M440 380 A48 48 0 0 0 392 428" opacity="0.9" />
        </g>
        {/* dimension strings */}
        <g className="d4" stroke="var(--color-dim)" strokeWidth="0.8" opacity="0.65">
          <path d="M120 52 H560" />
          <path d="M120 44 V60 M560 44 V60 M330 46 V58" />
          <path d="M88 90 V470" />
          <path d="M80 90 H96 M80 470 H96 M82 300 H94" />
        </g>
        <g className="lbl" fill="var(--color-dim)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="2">
          <text x="300" y="38" textAnchor="middle">44'-0"</text>
          <text x="64" y="284" textAnchor="middle" transform="rotate(-90 64 284)">38'-0"</text>
        </g>
        {/* room labels */}
        <g className="lbl" fill="var(--color-faint)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="3">
          <text x="222" y="200">STUDIO</text>
          <text x="430" y="200">FIELD</text>
          <text x="204" y="396">ARCHIVE</text>
          <text x="480" y="396">INTEL</text>
        </g>
        {/* datum crosshair */}
        <g className="d3" stroke="var(--color-amber)" strokeWidth="1">
          <circle cx="120" cy="470" r="9" />
          <path d="M120 455 V485 M105 470 H135" />
        </g>
        {/* title block corner */}
        <g className="d4">
          <path d="M420 470 V430 H560" stroke="var(--color-line-2)" strokeWidth="1" />
          <text x="436" y="456" fill="var(--color-faint)" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="2">DRAFTED BY JJ · JJ-001</text>
        </g>

        <style>{`
          .d1 path,.d2 path,.d3 path,.d3 circle,.d4 path{stroke-dasharray:1400;stroke-dashoffset:1400;animation:draw 2.2s var(--ease-expo) forwards}
          .d2 path{animation-delay:.5s}
          .d3 path,.d3 circle{animation-delay:1.15s;animation-duration:1.6s}
          .d4 path{animation-delay:1.5s;animation-duration:1.4s}
          .lbl{opacity:0;animation:fadein 1s ease 2s forwards}
          @keyframes draw{to{stroke-dashoffset:0}}
          @keyframes fadein{to{opacity:1}}
          @media (prefers-reduced-motion:reduce){
            .d1 path,.d2 path,.d3 path,.d3 circle,.d4 path{animation:none;stroke-dashoffset:0}
            .lbl{animation:none;opacity:1}
          }
        `}</style>
      </svg>
    </div>
  );
}
