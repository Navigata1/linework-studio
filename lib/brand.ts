// Central brand + studio config. One source of truth for names, taglines,
// and the tool registry that the hub and nav render from.

export const STUDIO = {
  name: process.env.NEXT_PUBLIC_STUDIO_NAME ?? "Linework Studio",
  shortName: "Linework",
  domain: process.env.NEXT_PUBLIC_STUDIO_DOMAIN ?? "jasminelineworks.com",
  signature: "Drafted by JJ",
  principal: "Jasmine Johnson",
  role: "Civil Engineer · CAD Drafting · Field Inspection",
  region: "Southern California",
  tagline: "Field to finish. Every line accounted for.",
  crew: "Island Development Crew",
} as const;

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
