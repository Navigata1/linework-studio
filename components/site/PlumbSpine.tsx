"use client";
import { useEffect, useRef, useState } from "react";

// The plumb line — a single drafting thread that runs the full height of the
// page and DRAWS ITSELF as you scroll, with survey stations that light up as
// each section arrives. This is the connective tissue tying the whole story
// together top to bottom. Fixed to the left gutter; hidden on small screens.
type Station = { id: string; label: string };

export function PlumbSpine({ stations }: { stations: Station[] }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    const ids = stations.map((s) => document.getElementById(s.id));
    // station marks at each section's REAL document position, so the bob
    // crosses a dot exactly as its section arrives
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setMarks(
        ids.map((el) => {
          if (!el || max <= 0) return 0;
          return Math.min(1, Math.max(0, (el.offsetTop - window.innerHeight * 0.45) / max));
        }),
      );
    };
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        const mid = window.scrollY + window.innerHeight * 0.45;
        let idx = 0;
        ids.forEach((el, i) => { if (el && el.offsetTop <= mid) idx = i; });
        setActive(idx);
      });
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { measure(); onScroll(); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); cancelAnimationFrame(raf.current); };
  }, [stations]);

  return (
    <div className="pointer-events-none fixed left-6 top-0 z-30 hidden h-screen w-10 lg:block xl:left-10" aria-hidden>
      {/* the rail */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[color-mix(in_oklab,var(--color-line-2)_70%,transparent)]" />
      {/* the drawn thread, filling with scroll */}
      <div
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 origin-top"
        style={{
          height: "100%",
          transform: `scaleY(${progress})`,
          background: "linear-gradient(180deg, var(--color-cyan), var(--color-blue) 60%, var(--color-blue-deep))",
          boxShadow: "0 0 10px color-mix(in oklab, var(--color-blue) 60%, transparent)",
        }}
      />
      {/* the plumb bob riding the leading edge */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: `calc(${progress * 100}% - 4px)`, transition: "top 0.08s linear" }}
      >
        <div className="h-2 w-2 rotate-45 bg-[var(--color-cyan)]" style={{ boxShadow: "0 0 12px var(--color-cyan)" }} />
      </div>
      {/* survey stations */}
      {stations.map((s, i) => {
        const fallback = stations.length > 1 ? i / (stations.length - 1) : 0;
        const top = (marks[i] ?? fallback) * 100;
        const on = i <= active;
        return (
          <div key={s.id} className="absolute left-1/2 flex -translate-x-1/2 items-center" style={{ top: `${top}%` }}>
            <span
              className="h-1.5 w-1.5 rounded-full transition-all duration-500"
              style={{
                background: on ? "var(--color-cyan)" : "var(--color-faint)",
                boxShadow: on ? "0 0 10px var(--color-cyan)" : "none",
                transform: on ? "scale(1.4)" : "scale(1)",
              }}
            />
            <span
              className="mono absolute left-4 whitespace-nowrap text-[8.5px] uppercase tracking-[0.22em] transition-all duration-500"
              style={{ color: on ? "var(--color-blue)" : "var(--color-faint)", opacity: on ? 1 : 0.5 }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
