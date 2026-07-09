// Shared shapes for the Report Engine. Mirrors the seven-field photo block
// and the header/work-log structure of Jasmine's daily inspector report.

export type PhotoEntry = {
  id: string;
  fileName: string;
  dataUrl: string; // base64 data URL for preview + docx embed
  date: string; // from EXIF DateTimeOriginal, else file mtime
  time: string;
  imageNo: string;
  activityNo: string;
  description: string;
  gps?: { lat: number; lng: number } | null;
};

export type LogEntry = { time: string; note: string };

export type ReportMeta = {
  contractNo: string;
  reportNo: string;
  date: string;
  inspector: string;
  weather: string;
  temperature: string;
  timeStart: string;
  timeFinish: string;
  project: string;
  location: string;
};

export type ReportPayload = {
  meta: ReportMeta;
  log: LogEntry[];
  photos: PhotoEntry[];
};

export const EMPTY_META: ReportMeta = {
  contractNo: "15QJ-131",
  reportNo: "",
  date: "",
  inspector: "Jasmine Johnson",
  weather: "Clear",
  temperature: "",
  timeStart: "",
  timeFinish: "",
  project: "",
  location: "",
};
