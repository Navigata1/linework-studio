import { NextResponse } from "next/server";
import { hasSupabase, serverClient } from "@/lib/supabase";

export const runtime = "nodejs";

type Intake = {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  dimensions?: string;
  deadline?: string;
  budget?: string;
  description: string;
};

function briefHtml(i: Intake): string {
  const row = (k: string, v?: string) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#5C6A82;font:12px monospace">${k}</td><td style="padding:4px 0">${v}</td></tr>` : "");
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:560px">
    <h2 style="font-family:'Space Grotesk',Arial">New project request — ${i.projectType}</h2>
    <table>${row("Name", i.name)}${row("Email", i.email)}${row("Phone", i.phone)}${row("Dimensions", i.dimensions)}${row("Deadline", i.deadline)}${row("Budget", i.budget)}</table>
    <p style="margin-top:16px;white-space:pre-wrap">${i.description}</p>
    <p style="color:#5C6A82;font:11px monospace;margin-top:20px">Brain Loft Studios · intake</p>
  </div>`;
}

async function sendEmail(i: Intake): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.STUDIO_NOTIFY_EMAIL;
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Brain Loft Studios <onboarding@resend.dev>",
        to: [to],
        reply_to: i.email,
        subject: `New CAD request — ${i.projectType} — ${i.name}`,
        html: briefHtml(i),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const i = (await req.json()) as Intake;
    if (!i.name || !i.email || !i.description) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    let stored = false;
    if (hasSupabase()) {
      try {
        const sb = serverClient();
        const { error } = await sb!.from("intake_requests").insert({
          name: i.name,
          email: i.email,
          phone: i.phone ?? null,
          project_type: i.projectType,
          dimensions: i.dimensions ?? null,
          deadline: i.deadline ?? null,
          budget: i.budget ?? null,
          description: i.description,
        });
        stored = !error;
      } catch {}
    }

    const emailed = await sendEmail(i);
    // Always log server-side so nothing is lost even with zero integrations.
    console.log("[intake]", JSON.stringify({ ...i, stored, emailed }));
    return NextResponse.json({ ok: true, stored, emailed });
  } catch (e) {
    return NextResponse.json({ error: "intake_failed" }, { status: 400 });
  }
}
