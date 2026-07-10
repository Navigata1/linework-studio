"use client";

// A single body of water behind the ENTIRE page. Fixed, full-viewport, z-0.
// Three cross-fading depth layers (surface → shallow → abyss) whose opacities
// are driven by the global --depth scroll variable, plus slow-drifting caustic
// light shafts. This is the continuity: the hero's water never "ends" — you
// descend through it, and it changes color and light the whole way down.
// Pure CSS motion (cheap); depth comes from <ScrollDepth>.
export function FluidBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* SURFACE — bright studio blue, dominant at the top */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "calc(1 - var(--depth, 0) * 0.85)",
          background:
            "radial-gradient(130% 90% at 72% 8%, color-mix(in oklab, var(--color-blue) 26%, var(--color-void)) 0%, transparent 55%)," +
            "linear-gradient(180deg, #06152c 0%, #051020 46%, #030b18 100%)",
        }}
      />
      {/* SHALLOW / THERMOCLINE — teal band that rises as you scroll into mid-page */}
      <div
        className="absolute inset-0 drift-slow"
        style={{
          opacity: "calc(0.42 - var(--depth, 0) * 0.22)",
          background:
            "radial-gradient(120% 60% at 30% 50%, color-mix(in oklab, var(--color-cyan) 20%, transparent) 0%, transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
      {/* ABYSS — near-black navy, takes over toward the floor */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "calc(var(--depth, 0) * 0.9)",
          background:
            "radial-gradient(120% 80% at 50% 120%, color-mix(in oklab, var(--color-blue-deep) 20%, #01040a) 0%, #01040a 62%)",
        }}
      />
      {/* CAUSTIC LIGHT SHAFTS — always drifting, brightest near the surface */}
      <div
        className="absolute inset-0 caustic"
        style={{ opacity: "calc(0.5 - var(--depth, 0) * 0.42)" }}
      />
      {/* floating motes / plankton for depth cue */}
      <div className="absolute inset-0 motes" />

      <style>{`
        @keyframes drift-x { 0%,100%{ transform: translate3d(-2%,0,0) } 50%{ transform: translate3d(3%,-2%,0) } }
        .drift-slow{ animation: drift-x 26s ease-in-out infinite; }
        .caustic{
          background-image:
            repeating-linear-gradient(72deg, transparent 0 22px, color-mix(in oklab, var(--color-cyan) 9%, transparent) 22px 24px, transparent 24px 46px),
            repeating-linear-gradient(108deg, transparent 0 30px, color-mix(in oklab, var(--color-blue) 7%, transparent) 30px 32px, transparent 32px 60px);
          background-size: 340px 340px, 420px 420px;
          animation: caustic-move 34s linear infinite;
          mix-blend-mode: screen;
          filter: blur(1px);
        }
        @keyframes caustic-move{ from{ background-position: 0 0, 0 0 } to{ background-position: 340px 180px, -420px 240px } }
        .motes{
          background-image:
            radial-gradient(1.5px 1.5px at 20% 30%, rgba(150,200,255,.5), transparent),
            radial-gradient(1.5px 1.5px at 70% 60%, rgba(120,230,220,.45), transparent),
            radial-gradient(1px 1px at 45% 80%, rgba(180,210,255,.4), transparent),
            radial-gradient(1px 1px at 85% 25%, rgba(120,230,220,.4), transparent);
          background-size: 600px 600px;
          animation: motes-rise 40s linear infinite;
          opacity: .5;
        }
        @keyframes motes-rise{ from{ background-position: 0 0 } to{ background-position: 0 -600px } }
        @media (prefers-reduced-motion: reduce){ .drift-slow,.caustic,.motes{ animation: none } }
      `}</style>
    </div>
  );
}
