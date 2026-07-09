import { NextResponse } from "next/server";
import { buildDossier, type Dossier, type DossierInput } from "@/lib/dossier";
import { hasSupabase, serverClient } from "@/lib/supabase";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink, BorderStyle } from "docx";

export const runtime = "nodejs";
export const maxDuration = 60;

async function dossierToDocx(d: Dossier): Promise<Uint8Array> {
  const kids: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: "SITE DOSSIER", bold: true, size: 40 })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: d.query, size: 22, color: "5C6A82" })] }),
    new Paragraph({
      spacing: { before: 200, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0A63D6" } },
      children: [new TextRun({ text: "PARCEL SUMMARY", bold: true, size: 22, color: "0A63D6" })],
    }),
    ...d.fields.map(
      (f) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${f.label}:  `, bold: true, size: 20 }),
            new TextRun({ text: f.value, size: 20, color: "1B2536" }),
          ],
        }),
    ),
  ];

  if (d.aiSummary) {
    kids.push(
      new Paragraph({
        spacing: { before: 240, after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0A63D6" } },
        children: [new TextRun({ text: "RESEARCH BRIEF", bold: true, size: 22, color: "0A63D6" })],
      }),
    );
    d.aiSummary.split("\n").filter(Boolean).forEach((line) =>
      kids.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: line.replace(/^[-*]\s*/, "• "), size: 20 })] })),
    );
  }

  kids.push(
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0A63D6" } },
      children: [new TextRun({ text: "SOURCES", bold: true, size: 22, color: "0A63D6" })],
    }),
    ...d.sources.map(
      (s) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new ExternalHyperlink({ link: s.url, children: [new TextRun({ text: s.label, size: 20, color: "0A63D6", underline: {} })] }),
            ...(s.note ? [new TextRun({ text: `  — ${s.note}`, size: 18, color: "5C6A82" })] : []),
          ],
        }),
    ),
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0A63D6" } },
      children: [new TextRun({ text: "FIELD CHECKLIST", bold: true, size: 22, color: "0A63D6" })],
    }),
    ...d.checklist.map((c) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `☐ ${c}`, size: 20 })] })),
  );

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: kids }] });
  return new Uint8Array(await Packer.toBuffer(doc));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DossierInput & { format?: "json" | "docx" };
    const dossier = await buildDossier(body);

    if (hasSupabase()) {
      try {
        const sb = serverClient();
        await sb?.from("dossiers").insert({ query: dossier.query, county: dossier.county });
      } catch {}
    }

    if (body.format === "docx") {
      const bytes = await dossierToDocx(dossier);
      const fname = `Site_Dossier_${(dossier.query || "site").replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}.docx`;
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${fname}"`,
        },
      });
    }
    return NextResponse.json(dossier);
  } catch (e) {
    return NextResponse.json({ error: "dossier_failed", detail: String(e) }, { status: 500 });
  }
}
