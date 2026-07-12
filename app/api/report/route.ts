import { NextResponse } from "next/server";
import { buildReportDocx } from "@/lib/report/docx";
import type { ReportPayload } from "@/lib/report/types";
import { hasSupabase, serverClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ReportPayload & { logOnly?: boolean; photoCount?: number };
    if (!payload?.meta) return NextResponse.json({ error: "missing_meta" }, { status: 400 });

    // logOnly: the docx was generated client-side (no 4.5MB body ceiling) —
    // this call only records report metadata. Photos are never sent.
    if (payload.logOnly) {
      if (hasSupabase()) {
        try {
          const sb = serverClient();
          await sb?.from("reports").insert({
            contract_no: payload.meta.contractNo,
            report_no: payload.meta.reportNo,
            report_date: payload.meta.date || null,
            inspector: payload.meta.inspector,
            photo_count: payload.photoCount ?? 0,
          });
        } catch {
          /* non-fatal */
        }
      }
      return NextResponse.json({ ok: true });
    }

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
