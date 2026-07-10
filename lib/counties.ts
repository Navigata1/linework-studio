// California county record sources — Northern California first (where Jasmine
// works), Southern California kept (where her roots are). Powers the Site
// Dossier's "always-works" layer: authoritative deep-links even when
// automated lookups vary.

export type CountySource = {
  county: string;
  assessor: { label: string; url: string };
  recorder: { label: string; url: string };
  gis: { label: string; url: string };
  parcelSearch: { label: string; url: string };
};

export const CA_COUNTIES: CountySource[] = [
  {
    county: "Sacramento",
    assessor: { label: "Sacramento County Assessor", url: "https://assessor.saccounty.gov/" },
    recorder: { label: "Sacramento County Clerk/Recorder", url: "https://ccr.saccounty.gov/" },
    gis: { label: "Sacramento County GIS Viewer", url: "https://generalmap.gis.saccounty.gov/JSViewer/county_portal.html" },
    parcelSearch: { label: "Assessor Parcel Viewer", url: "https://assessorparcelviewer.saccounty.gov/jsviewer/assessor.html" },
  },
  {
    county: "Placer",
    assessor: { label: "Placer County Assessor", url: "https://www.placer.ca.gov/1502/Assessor" },
    recorder: { label: "Placer County Clerk-Recorder", url: "https://www.placer.ca.gov/2072/Clerk-Recorder" },
    gis: { label: "Placer County GIS / Open Data", url: "https://data-placer.opendata.arcgis.com/" },
    parcelSearch: { label: "Parcel & Property Search", url: "https://common1.mptsweb.com/mbap/placer/asr" },
  },
  {
    county: "Yolo",
    assessor: { label: "Yolo County Assessor", url: "https://www.yolocounty.gov/government/general-government-departments/assessor" },
    recorder: { label: "Yolo County Clerk-Recorder", url: "https://www.yolocounty.gov/government/general-government-departments/county-clerk-recorder" },
    gis: { label: "Yolo County GIS", url: "https://www.yolocounty.gov/government/general-government-departments/information-technology/gis" },
    parcelSearch: { label: "Parcel Search (Megabyte)", url: "https://common3.mptsweb.com/MBAP/yolo/asr" },
  },
  {
    county: "San Joaquin",
    assessor: { label: "San Joaquin County Assessor", url: "https://www.sjgov.org/department/asrec/assessor" },
    recorder: { label: "SJC Recorder-County Clerk", url: "https://www.sjgov.org/department/asrec/recorder" },
    gis: { label: "SJC GIS / SJMAP", url: "https://sjmap.org/" },
    parcelSearch: { label: "Assessment Search", url: "https://apps.sjgov.org/assessor/search/" },
  },
  {
    county: "Alameda",
    assessor: { label: "Alameda County Assessor", url: "https://www.acassessor.org/" },
    recorder: { label: "Alameda County Clerk-Recorder", url: "https://www.acgov.org/auditor/clerk/" },
    gis: { label: "Alameda County GIS Parcel Viewer", url: "https://www.acgov.org/government/geospatial.htm" },
    parcelSearch: { label: "Property Assessment Search", url: "https://www.acassessor.org/homeowners/review-your-value/" },
  },
  {
    county: "Contra Costa",
    assessor: { label: "Contra Costa Assessor", url: "https://www.contracosta.ca.gov/191/Assessor" },
    recorder: { label: "CCC Clerk-Recorder", url: "https://www.contracosta.ca.gov/6146/Clerk-Recorder" },
    gis: { label: "CCC GIS / Mapping", url: "https://gis.cccounty.us/" },
    parcelSearch: { label: "Assessor Parcel Search", url: "https://gus.cccounty.us/apps/assessor/" },
  },
  {
    county: "Santa Clara",
    assessor: { label: "Santa Clara County Assessor", url: "https://www.sccassessor.org/" },
    recorder: { label: "SCC Clerk-Recorder", url: "https://clerkrecorder.sccgov.org/" },
    gis: { label: "SCC Planning GIS / SCCMap", url: "https://plandev.sccgov.org/maps-property-info/sccmap" },
    parcelSearch: { label: "Property Assessment Info", url: "https://www.sccassessor.org/online-services/property-search/real-property" },
  },
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
