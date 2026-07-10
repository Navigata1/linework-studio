// Brand marks for both candidate domains. Each is pure inline SVG (no assets),
// theme-aware via currentColor, and comes as a monogram + full wordmark.

export function LineworkMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  // Heritage mark: three stacked drafting lines of increasing weight (a
  // "lineweight ramp") anchored to a plumb baseline. Lives on in the identity
  // section as the craft vocabulary.
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="4" stroke="var(--color-line-2)" />
      <path d="M11 10 H29" stroke="var(--color-blue)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 17 H27" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M11 24 H24" stroke="var(--color-blue)" strokeWidth="3.2" strokeLinecap="round" opacity="0.7" />
      <path d="M11 10 V30 H30" stroke="var(--color-amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="10" r="1.9" fill="var(--color-amber)" />
    </svg>
  );
}

export function BrainLoftMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  // Concept: the loft — a gable roofline sheltering ascending drafting lines,
  // ideas rising into the upstairs room where they're kept and drawn true.
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="4" stroke="var(--color-line-2)" />
      {/* gable / loft roof */}
      <path d="M8 19 L20 8 L32 19" stroke="var(--color-amber)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 31 V17.3 M29 31 V17.3" stroke="var(--color-amber)" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      {/* rising lineweight ramp inside the loft */}
      <path d="M15 27 H25" stroke="var(--color-blue)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M15 22.5 H23.5" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M15 18.5 H22" stroke="var(--color-blue)" strokeWidth="1.2" strokeLinecap="round" />
      {/* the idea at the ridge */}
      <circle cx="20" cy="8" r="2" fill="var(--color-cyan)" />
    </svg>
  );
}

export function DraftedMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  // Concept: a CAD title-block corner + a nib, forming a stamp — "drafted by".
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="4" stroke="var(--color-line-2)" />
      <path d="M8 8 H32 V32 H8 Z" stroke="var(--color-amber)" strokeWidth="1.2" opacity="0.55" />
      <path d="M8 24 H24 V32" stroke="var(--color-amber)" strokeWidth="1.4" />
      <path d="M20 9 L27 16 L18 25 L14 26 L15 22 Z" fill="none" stroke="var(--color-blue)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 22 L18 25" stroke="var(--color-blue)" strokeWidth="1.6" />
      <circle cx="16.6" cy="23.4" r="1" fill="var(--color-blue)" />
    </svg>
  );
}

export function Wordmark({
  brand = "linework",
  className = "",
}: {
  brand?: "linework" | "drafted";
  className?: string;
}) {
  if (brand === "drafted") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <DraftedMark />
        <span className="leading-none">
          <span className="font-[family-name:var(--font-display)] text-[17px] font-bold tracking-tight">
            drafted<span className="text-[var(--color-amber)]">by</span>jj
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrainLoftMark />
      <span className="leading-none">
        <span className="font-[family-name:var(--font-display)] text-[17px] font-bold tracking-tight">
          Brain<span className="text-[var(--color-blue)]">Loft</span>
          <span className="ml-1.5 font-normal text-[var(--color-dim)]">Studios</span>
        </span>
      </span>
    </span>
  );
}
