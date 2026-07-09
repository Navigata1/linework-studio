"use client";
import { useEffect, useRef } from "react";

// Living blueprint: an isometric structure that draws itself with a plotter
// feel, then a hairline sweeps the field. Pointer parallax on desktop.
// Fully static under prefers-reduced-motion.
export function HeroBlueprint() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 14;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform">
      <svg viewBox="0 0 600 600" className="h-[118%] w-[118%] max-w-none opacity-[0.55]" fill="none" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-blue)" />
            <stop offset="1" stopColor="var(--color-cyan)" />
          </linearGradient>
        </defs>
        {/* isometric footprint */}
        <g stroke="url(#lg)" strokeWidth="1.1" className="draw">
          <path d="M300 180 L470 270 L300 360 L130 270 Z" />
          <path d="M130 270 L130 400 L300 490 L300 360" />
          <path d="M300 360 L300 490 L470 400 L470 270" />
          <path d="M300 180 L300 90" strokeDasharray="4 5" />
          <path d="M470 270 L520 245" strokeDasharray="4 5" />
          <path d="M130 270 L80 245" strokeDasharray="4 5" />
        </g>
        <g stroke="var(--color-amber)" strokeWidth="1" opacity="0.8" className="draw2">
          <path d="M300 180 L300 310 L470 400" />
          <path d="M300 310 L130 400" />
          <circle cx="300" cy="180" r="3" fill="var(--color-amber)" />
          <circle cx="300" cy="490" r="3" fill="var(--color-amber)" />
        </g>
        {/* dimension ticks */}
        <g stroke="var(--color-dim)" strokeWidth="0.8" opacity="0.5">
          <path d="M130 520 L470 520" />
          <path d="M130 514 L130 526 M470 514 L470 526" />
        </g>
        <style>{`
          .draw path { stroke-dasharray: 700; stroke-dashoffset: 700; animation: dr 2.4s var(--ease-expo) forwards; }
          .draw path:nth-child(2){animation-delay:.25s} .draw path:nth-child(3){animation-delay:.4s}
          .draw path:nth-child(4){animation-delay:.9s} .draw path:nth-child(5){animation-delay:1s} .draw path:nth-child(6){animation-delay:1.1s}
          .draw2 path { stroke-dasharray: 500; stroke-dashoffset: 500; animation: dr 2s var(--ease-expo) 1.2s forwards; }
          @keyframes dr { to { stroke-dashoffset: 0; } }
          @media (prefers-reduced-motion: reduce){ .draw path,.draw2 path{ animation:none; stroke-dashoffset:0 } }
        `}</style>
      </svg>
    </div>
  );
}
