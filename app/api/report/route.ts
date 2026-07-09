import { NextResponse } from "next/server";
import { buildReportDocx } from "@/lib/report/docx";
import type { ReportPayload } from "@/lib/report/types";
import { hasSupabase, serverClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ReportPayload;
    if (!payload?.meta) return NextResponse.json({ error: "missing_meta" }, { status: 400 });

    const bytes = await buildReportDocx(payload);

    // Best-effort persistence of report metadata (never blocks the download).
    if (hasSupabase()) {
      try {
        const sb = serverClient();
        await sb?.from("reports").insert({
          contract_no: payload.meta.contractNo,
          report_no: payload.meta.reportNo,
          report_date: payload.meta.date || null,
          inspector: payload.meta.inspector,
          photo_count: payload.photos?.length ?? 0,
        });
      } catch {
        /* non-fatal */
      }
    }

    const fname = `Daily_Report_${(payload.meta.reportNo || "DRAFT").replace(/\s+/g, "-")}_${payload.meta.contractNo}.docx`;
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fname}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "report_failed", detail: String(e) }, { status: 500 });
  }
}
