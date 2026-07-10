// SVG wave divider — the surface line between the water (dark) and the vellum
// drawing sheet (light). Layered crests give a sense of a real waterline.
// `fill` is the color the wave pours INTO (the section it borders toward).
// `flip` puts the crest on the bottom edge instead of the top.
export function Wave({ fill, flip = false, className = "" }: { fill: string; flip?: boolean; className?: string }) {
  return (
    <div
      className={`pointer-events-none relative z-10 -my-px w-full overflow-hidden ${className}`}
      style={{ transform: flip ? "scaleY(-1)" : undefined, lineHeight: 0 }}
      aria-hidden
    >
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[60px] w-full md:h-[90px]">
        <path
          d="M0,40 C240,90 420,10 720,45 C1020,80 1200,15 1440,50 L1440,90 L0,90 Z"
          fill={fill}
          opacity="0.55"
        />
        <path
          d="M0,55 C260,20 480,85 720,55 C960,25 1180,80 1440,48 L1440,90 L0,90 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
