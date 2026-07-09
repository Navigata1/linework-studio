// Rebuilds Jasmine's daily inspector report as an editable .docx.
// Runs server-side (Node) inside the /api/report route.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  HeadingLevel,
  PageBreak,
} from "docx";
import type { ReportPayload, ReportMeta, PhotoEntry } from "./types";

const INK = "1B2536";
const BLUE = "0A63D6";
const DIM = "5C6A82";

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; ext: "png" | "jpg" } {
  const match = /^data:image\/(png|jpe?g);base64,(.*)$/i.exec(dataUrl);
  const b64 = match ? match[2] : dataUrl.replace(/^data:.*;base64,/, "");
  const bytes = Uint8Array.from(Buffer.from(b64, "base64"));
  const ext = match && /jpe?g/i.test(match[1]) ? "jpg" : "png";
  return { bytes, ext };
}

function labelCell(label: string, value: string): TableCell {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: label.toUpperCase(), bold: true, size: 14, color: DIM, font: "Consolas" }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: value || "—", size: 20, color: INK, font: "Calibri" })],
      }),
    ],
  });
}

function metaTable(meta: ReportMeta): Table {
  const rows = [
    ["Contract No.", meta.contractNo, "Report No.", meta.reportNo],
    ["Date", meta.date, "Inspector", meta.inspector],
    ["Weather", meta.weather, "Temperature", meta.temperature],
    ["Time Start", meta.timeStart, "Time Finish", meta.timeFinish],
    ["Project", meta.project, "Location", meta.location],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r) =>
        new TableRow({
          children: [labelCell(r[0], r[1]), labelCell(r[2], r[3])],
        }),
    ),
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: BLUE, font: "Calibri" })],
  });
}

function photoBlock(p: PhotoEntry, idx: number): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  if (idx > 0) out.push(new Paragraph({ children: [new PageBreak()] }));

  out.push(sectionHeading(`Photo ${p.imageNo || idx + 1}`));

  // The seven-field block, as a compact table.
  out.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [labelCell("Image No.", p.imageNo), labelCell("Activity No.", p.activityNo)] }),
        new TableRow({ children: [labelCell("Date", p.date), labelCell("Time", p.time)] }),
      ],
    }),
  );

  // Embedded image, sized to fit the page width.
  try {
    const { bytes, ext } = dataUrlToBytes(p.dataUrl);
    out.push(
      new Paragraph({
        spacing: { before: 160, after: 120 },
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: bytes,
            type: ext === "jpg" ? "jpg" : "png",
            transformation: { width: 520, height: 390 },
          }),
        ],
      }),
    );
  } catch {
    out.push(new Paragraph({ children: [new TextRun({ text: `[image: ${p.fileName}]`, italics: true, color: DIM })] }));
  }

  out.push(
    new Paragraph({
      spacing: { before: 80 },
      children: [
        new TextRun({ text: "Activity Description:  ", bold: true, size: 20, color: INK }),
        new TextRun({ text: p.description || "—", size: 20, color: INK }),
      ],
    }),
  );
  return out;
}

export async function buildReportDocx(payload: ReportPayload): Promise<Uint8Array> {
  const { meta, log, photos } = payload;

  const header: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: "DAILY INSPECTION REPORT", bold: true, size: 40, color: INK, font: "Calibri" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: `${meta.project || "Project"} · Contract ${meta.contractNo}`, size: 20, color: DIM }),
      ],
    }),
  ];

  const logSection: (Paragraph | Table)[] = [sectionHeading("Work Log")];
  if (log.length === 0) {
    logSection.push(new Paragraph({ children: [new TextRun({ text: "No log entries recorded.", italics: true, color: DIM })] }));
  } else {
    logSection.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: log.map(
          (e) =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 18, type: WidthType.PERCENTAGE },
                  margins: { top: 40, bottom: 40, left: 100, right: 100 },
                  children: [new Paragraph({ children: [new TextRun({ text: e.time || "—", bold: true, size: 18, color: BLUE, font: "Consolas" })] })],
                }),
                new TableCell({
                  width: { size: 82, type: WidthType.PERCENTAGE },
                  margins: { top: 40, bottom: 40, left: 100, right: 100 },
                  children: [new Paragraph({ children: [new TextRun({ text: e.note, size: 20, color: INK })] })],
                }),
              ],
            }),
        ),
      }),
    );
  }

  const photoSection: (Paragraph | Table)[] = [];
  if (photos.length) {
    photoSection.push(new Paragraph({ children: [new PageBreak()] }));
    photoSection.push(sectionHeading("Photo Log"));
    photos.forEach((p, i) => photoBlock(p, i).forEach((el) => photoSection.push(el)));
  }

  const doc = new Document({
    creator: "Linework Studio",
    title: `Daily Report ${meta.reportNo || ""} — ${meta.contractNo}`,
    styles: {
      default: { document: { run: { font: "Calibri" } } },
    },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [...header, sectionHeading("Report Details"), metaTable(meta), ...logSection, ...photoSection],
      },
    ],
  });

  const blob = await Packer.toBuffer(doc);
  return new Uint8Array(blob);
}
