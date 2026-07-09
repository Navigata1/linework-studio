// Site Dossier assembly. Combines deterministic county record sources (always
// works) with an optional AI research synthesis and optional parcel API data.
import { CA_COUNTIES, FEMA_FLOOD, countyByName, type CountySource } from "./counties";
import { askClaude, hasAI } from "./anthropic";

export type DossierInput = { address?: string; apn?: string; county?: string };

export type DossierSource = { label: string; url: string; note?: string };

export type Dossier = {
  query: string;
  county: string | null;
  generatedNote: string;
  aiSummary: string | null;
  fields: { label: string; value: string }[];
  sources: DossierSource[];
  checklist: string[];
};

function guessCounty(input: DossierInput): CountySource | undefined {
  if (input.county) {
    const c = countyByName(input.county);
    if (c) return c;
  }
  const hay = `${input.address ?? ""}`.toLowerCase();
  return CA_COUNTIES.find((c) => hay.includes(c.county.toLowerCase()));
}

const AI_SYSTEM =
  "You are a civil engineering research assistant preparing a site dossier for a CAD/inspection project in Southern California. " +
  "Given an address or APN, summarize what a drafter should know before starting: likely jurisdiction, what parcel/zoning/flood records to pull and from where, and any research cautions. " +
  "Be concrete and brief (5-7 bullet points). Never fabricate specific parcel numbers, owners, or dimensions — flag those as 'verify from source'.";

export async function buildDossier(input: DossierInput): Promise<Dossier> {
  const county = guessCounty(input);
  const query = input.apn ? `APN ${input.apn}` : input.address || "(no address provided)";

  const sources: DossierSource[] = [];
  if (county) {
    sources.push(
      { label: county.assessor.label, url: county.assessor.url, note: "Owner of record, assessed value, APN" },
      { label: county.parcelSearch.label, url: county.parcelSearch.url, note: "Parcel detail & maps" },
      { label: county.recorder.label, url: county.recorder.url, note: "Deeds, easements, recorded documents" },
      { label: county.gis.label, url: county.gis.url, note: "Parcel geometry, zoning overlays" },
    );
  } else {
    // Unknown county — offer all SoCal doorways.
    CA_COUNTIES.forEach((c) => sources.push({ label: `${c.county} — Assessor`, url: c.assessor.url }));
  }
  sources.push({ label: FEMA_FLOOD.label, url: FEMA_FLOOD.url, note: "Flood zone determination" });

  const fields = [
    { label: "Query", value: query },
    { label: "Jurisdiction", value: county ? `${county.county} County, CA` : "Determine from address" },
    { label: "APN", value: input.apn || "Pull from assessor" },
    { label: "Owner of Record", value: "Verify from assessor" },
    { label: "Zoning", value: "Verify from county GIS / planning" },
    { label: "Flood Zone", value: "Verify from FEMA FIRM" },
    { label: "Deed / Easements", value: "Pull from recorder" },
  ];

  const checklist = [
    "Confirm APN and legal description from the assessor parcel detail.",
    "Download the parcel map / plat and note dimensions and bearings.",
    "Capture zoning designation and any overlay districts.",
    "Run the FEMA flood determination for the parcel.",
    "Pull the current deed and check for easements or rights-of-way.",
    "Save every source PDF to the project folder with the APN in the filename.",
  ];

  let aiSummary: string | null = null;
  if (hasAI()) {
    const prompt = `Address: ${input.address || "(none)"}\nAPN: ${input.apn || "(none)"}\nLikely county: ${county?.county ?? "unknown"}\nPrepare the research brief.`;
    aiSummary = await askClaude(AI_SYSTEM, prompt, 600);
  }

  return {
    query,
    county: county?.county ?? null,
    generatedNote: hasAI()
      ? "Research brief drafted by AI; all parcel specifics must be verified from the linked sources."
      : "Deterministic source map. Add ANTHROPIC_API_KEY to enable the AI research brief.",
    aiSummary,
    fields,
    sources,
    checklist,
  };
}
