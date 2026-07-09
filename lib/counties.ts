// Southern California county record sources. Powers the Site Dossier's
// "always-works" layer: authoritative deep-links even when automated
// lookups vary. Query-string patterns are best-effort launchers.

export type CountySource = {
  county: string;
  assessor: { label: string; url: string };
  recorder: { label: string; url: string };
  gis: { label: string; url: string };
  parcelSearch: { label: string; url: string };
};

export const CA_COUNTIES: CountySource[] = [
  {
    county: "Los Angeles",
    assessor: { label: "LA County Assessor Portal", url: "https://portal.assessor.lacounty.gov/" },
    recorder: { label: "Registrar-Recorder/County Clerk", url: "https://www.lavote.gov/home/recorder" },
    gis: { label: "LA County GIS / Parcel Viewer", url: "https://egis-lacounty.hub.arcgis.com/" },
    parcelSearch: { label: "Assessor Parcel Search", url: "https://portal.assessor.lacounty.gov/parceldetail/" },
  },
  {
    county: "Orange",
    assessor: { label: "OC Assessor", url: "https://www.ocassessor.gov/" },
    recorder: { label: "OC Clerk-Recorder", url: "https://cr.ocgov.com/" },
    gis: { label: "OC Public Works GIS", url: "https://www.ocpublicworks.com/gis" },
    parcelSearch: { label: "OC Parcel Report", url: "https://ocpw.maps.arcgis.com/" },
  },
  {
    county: "Riverside",
    assessor: { label: "Riverside County Assessor", url: "https://rivcoview.rivcoacr.org/" },
    recorder: { label: "Assessor-County Clerk-Recorder", url: "https://www.rivcoacr.org/" },
    gis: { label: "Riverside County Map (RCIT)", url: "https://gisportal.rivcoit.org/" },
    parcelSearch: { label: "RivcoView Parcel Search", url: "https://rivcoview.rivcoacr.org/" },
  },
  {
    county: "San Bernardino",
    assessor: { label: "SB County Assessor-Recorder-Clerk", url: "https://www.sbcounty.gov/assessor/" },
    recorder: { label: "Recorder-County Clerk", url: "https://arc.sbcounty.gov/" },
    gis: { label: "SB County Open GIS", url: "https://gis.sbcounty.gov/" },
    parcelSearch: { label: "Parcel Access", url: "https://arc.sbcounty.gov/parcel-access/" },
  },
  {
    county: "San Diego",
    assessor: { label: "SD County Assessor/Recorder/Clerk", url: "https://arcc.sdcounty.ca.gov/" },
    recorder: { label: "ARCC Recorder", url: "https://arcc.sdcounty.ca.gov/Pages/recorder.aspx" },
    gis: { label: "SanGIS / Parcel Viewer", url: "https://sdgis-sandag.opendata.arcgis.com/" },
    parcelSearch: { label: "Property Sales & Parcel", url: "https://arcc.sdcounty.ca.gov/Pages/Property-Sales-Information.aspx" },
  },
  {
    county: "Ventura",
    assessor: { label: "Ventura County Assessor", url: "https://assessor.countyofventura.org/" },
    recorder: { label: "County Clerk & Recorder", url: "https://recorder.countyofventura.org/" },
    gis: { label: "VCcheck / GIS", url: "https://vccheck.ventura.org/" },
    parcelSearch: { label: "Property Assessment Search", url: "https://assessor.countyofventura.org/property-search/" },
  },
];

export const FEMA_FLOOD = {
  label: "FEMA Flood Map Service Center",
  url: "https://msc.fema.gov/portal/search",
};

export function countyByName(name?: string): CountySource | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase().replace(/\s+county$/, "").trim();
  return CA_COUNTIES.find((c) => c.county.toLowerCase() === n);
}
