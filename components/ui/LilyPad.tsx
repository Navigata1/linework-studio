"use client";
import { useEffect, useRef } from "react";

// Lily-pad physics: the element floats (idle bob), tilts toward wherever it's
// touched — press the corner and that corner dips; press dead-center and it
// sinks flat — then springs back with a damped underwater wobble. Every touch
// casts a light ripple across the glass and a displacement ring in the water
// beneath. Pure rAF spring, no libraries; inert under prefers-reduced-motion.

type Props = {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees at the far edge
  bobDelay?: string; // stagger the idle float
};

export function LilyPad({ children, className = "", maxTilt = 9, bobDelay = "0s" }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // spring state: current & target for rotX, rotY, sink
  const s = useRef({ rx: 0, ry: 0, sk: 0, vrx: 0, vry: 0, vsk: 0, trx: 0, try: 0, tsk: 0, raf: 0, reduce: false });

  useEffect(() => {
    s.current.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inner = innerRef.current;
    if (!inner || s.current.reduce) return;

    const STIFF = 0.085, DAMP = 0.86; // underdamped → watery wobble on release
    const tick = () => {
      const st = s.current;
      st.vrx = (st.vrx + (st.trx - st.rx) * STIFF) * DAMP;
      st.vry = (st.vry + (st.try - st.ry) * STIFF) * DAMP;
      st.vsk = (st.vsk + (st.tsk - st.sk) * STIFF) * DAMP;
      st.rx += st.vrx; st.ry += st.vry; st.sk += st.vsk;
      inner.style.transform =
        `perspective(900px) rotateX(${st.rx.toFixed(3)}deg) rotateY(${st.ry.toFixed(3)}deg) translateZ(${(-st.sk * 14).toFixed(2)}px) scale(${1 - st.sk * 0.012})`;
      const settled =
        Math.abs(st.rx) + Math.abs(st.ry) + Math.abs(st.sk) < 0.01 &&
        Math.abs(st.vrx) + Math.abs(st.vry) + Math.abs(st.vsk) < 0.005 &&
        st.trx === 0 && st.try === 0 && st.tsk === 0;
      if (settled) { inner.style.transform = ""; st.raf = 0; return; }
      st.raf = requestAnimationFrame(tick);
    };
    const ensureLoop = () => { if (!s.current.raf) s.current.raf = requestAnimationFrame(tick); };
    (inner as HTMLDivElement & { __ensureLoop?: () => void }).__ensureLoop = ensureLoop;
    return () => { cancelAnimationFrame(s.current.raf); s.current.raf = 0; };
  }, []);

  const aim = (e: React.PointerEvent, pressing: boolean) => {
    const st = s.current;
    if (st.reduce) return;
    const el = innerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;  // -1 .. 1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    const press = pressing ? 1 : 0.45;
    // edge distance decides tilt vs sink: center touch = sink, edge = dip
    st.trx = -ny * maxTilt * press;
    st.try = nx * maxTilt * press;
    st.tsk = (1 - Math.min(1, Math.abs(nx) + Math.abs(ny))) * press + press * 0.25;
    (el as HTMLDivElement & { __ensureLoop?: () => void }).__ensureLoop?.();
  };

  const release = () => {
    const st = s.current;
    st.trx = 0; st.try = 0; st.tsk = 0;
    (innerRef.current as (HTMLDivElement & { __ensureLoop?: () => void }) | null)?.__ensureLoop?.();
  };

  const splash = (e: React.PointerEvent) => {
    if (s.current.reduce) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const r = inner.getBoundingClientRect();
    // refraction ring on the glass at the touch point
    const ring = document.createElement("span");
    ring.className = "lily-ripple";
    ring.style.left = `${e.clientX - r.left}px`;
    ring.style.top = `${e.clientY - r.top}px`;
    inner.appendChild(ring);
    setTimeout(() => ring.remove(), 1200);
    // displacement ring in the water beneath the pad
    const under = document.createElement("span");
    under.className = "lily-ripple-under";
    outer.appendChild(under);
    setTimeout(() => under.remove(), 1450);
    aim(e, true);
  };

  return (
    <div ref={outerRef} className="lily-bob relative" style={{ animationDelay: bobDelay }}>
      <div
        ref={innerRef}
        className={`relative will-change-transform ${className}`}
        style={{ transformStyle: "preserve-3d" }}
        onPointerMove={(e) => aim(e, e.buttons > 0)}
        onPointerDown={splash}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
      >
        {children}
      </div>
    </div>
  );
}
