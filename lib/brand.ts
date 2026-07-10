// Central brand + studio config. One source of truth for names, taglines,
// and the tool registry that the hub and nav render from.

export const STUDIO = {
  name: process.env.NEXT_PUBLIC_STUDIO_NAME ?? "Brain Loft Studios",
  shortName: "Brain Loft",
  domain: process.env.NEXT_PUBLIC_STUDIO_DOMAIN ?? "brainloftstudios.com",
  signature: "Drafted by JJ",
  principal: "Jasmine Johnson",
  role: "Civil Engineer · CAD Drafting · Field Inspection",
  region: "Southern California",
  tagline: "Inspired design, drafted true.",
  ethos: "Inspired Design",
  crew: "Island Development Crew",
} as const;

// The name candidates live on as the brand's vocabulary — the texture of the
// marquee, section labels, and title blocks.
export const DRAFTING_TERMS = [
  "linework",
  "datum",
  "plumb line",
  "field-to-finish",
  "meridian",
  "as-built",
  "title block",
  "benchmark",
  "section cut",
  "drafted by JJ",
] as const;

export type Service = {
  no: string;
  name: string;
  desc: string;
  turnaround: string;
  from: string;
};

export const SERVICES: Service[] = [
  {
    no: "S-01",
    name: "Floor plan from sketch",
    desc: "Napkin sketch, photo, or field notes become a clean, dimensioned, permit-ready floor plan.",
    turnaround: "3–5 days",
    from: "from $250",
  },
  {
    no: "S-02",
    name: "As-built drawing",
    desc: "Existing conditions documented into accurate as-built plans — measured, layered, plottable.",
    turnaround: "5–7 days",
    from: "from $400",
  },
  {
    no: "S-03",
    name: "Site plan / exhibit",
    desc: "Parcel, setbacks, easements, and improvements composed into a submission-ready site exhibit.",
    turnaround: "3–5 days",
    from: "from $350",
  },
  {
    no: "S-04",
    name: "PDF → DWG conversion",
    desc: "Flat PDFs and scans rebuilt as native, editable AutoCAD files with true layers and lineweights.",
    turnaround: "2–4 days",
    from: "from $150",
  },
];

export type Tool = {
  slug: string;
  code: string;
  name: string;
  blurb: string;
  href: string;
  accent: "blue" | "amber" | "cyan";
  status: "live" | "beta";
};

export const TOOLS: Tool[] = [
  {
    slug: "report",
    code: "WS-01",
    name: "Report Engine",
    blurb:
      "Drop the day's site photos. EXIF fills date, time and location; AI drafts each activity description; one click renders your inspector report as an editable Word doc.",
    href: "/studio/report",
    accent: "blue",
    status: "live",
  },
  {
    slug: "dossier",
    code: "WS-03",
    name: "Site Dossier",
    blurb:
      "Enter an address or APN. The studio compiles parcel geometry, owner of record, zoning, flood zone and deed references into a cited dossier — the two-day research slog in minutes.",
    href: "/studio/dossier",
    accent: "cyan",
    status: "live",
  },
  {
    slug: "storefront",
    code: "WS-02",
    name: "Client Intake",
    blurb:
      "Your storefront, not Fiverr's. Clients submit real CAD requests — dimensions, sketches, deadlines — and each lands as a clean, quotable brief instead of a rambling text thread.",
    href: "/hire",
    accent: "amber",
    status: "live",
  },
];

export const ACCENT_VAR: Record<Tool["accent"], string> = {
  blue: "var(--color-blue)",
  amber: "var(--color-amber)",
  cyan: "var(--color-cyan)",
};
