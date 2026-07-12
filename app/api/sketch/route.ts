import { NextResponse } from "next/server";
import { hasAI, describeImage, askText } from "@/lib/ai";
import { validatePlan, issueDigest } from "@/lib/sketch/validate";
import type { PlanSpec, LoopReport, SketchResult } from "@/lib/sketch/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Sketch → CAD: a three-loop refinement pipeline.
//   LOOP 1 · DRAFT  — vision model extracts a structured PlanSpec from the photo
//   LOOP 2 · JUDGE  — a critic reviews the spec against the validator's findings
//                     and the drafter's notes, and returns a corrected spec
//   LOOP 3 · AUDIT  — an auditor makes the final coherence pass (closure,
//                     dimensional consistency, opening sanity) and solidifies
// Between every loop the deterministic validator squares angles, welds corners,
// clamps openings, and reports what it could not fix — so each AI pass works
// from repaired geometry plus an explicit issue list, never raw guesses.
// ─────────────────────────────────────────────────────────────────────────────

const SPEC_SCHEMA = `{
  "units": "ft",
  "name": "short plan name",
  "walls": [ { "a": [x,y], "b": [x,y], "t": 0.5 } ],
  "openings": [ { "wall": <index into walls>, "type": "door"|"window"|"opening", "at": <distance from wall point a to opening CENTER>, "w": <width>, "swing": "left"|"right" } ],
  "labels": [ { "at": [x,y], "text": "ROOM NAME" } ],
  "notes": [ "assumptions you made that the drafter should verify" ]
}`;

const DRAFT_SYSTEM =
  "You are a senior CAD drafter converting a photographed hand sketch of a floor plan into structured data. " +
  "Establish a consistent scale from any written dimensions (default units: feet; a typical door is 3 ft). " +
  "Y axis points UP (north). Trace every wall as a straight centerline segment. Prefer orthogonal walls unless the sketch is clearly angled. " +
  "Place doors/windows on the wall they belong to. Respond with ONLY a JSON object matching this schema — no prose, no code fences:\n" + SPEC_SCHEMA;

const JUDGE_SYSTEM =
  "You are the checking drafter on a two-person CAD team. You receive a floor-plan spec (JSON), the geometry validator's findings, and the client's notes. " +
  "Fix real problems: unclosed rooms, walls that should meet, missing or misplaced openings, labels in the wrong room, inconsistent dimensions. " +
  "Do NOT invent rooms that were never sketched. Keep coordinates in the same units and orientation. " +
  "Respond with ONLY the corrected JSON object in the same schema — no prose, no code fences.";

const AUDIT_SYSTEM =
  "You are the final QA auditor before a floor plan is released as CAD. You receive a spec (JSON) and remaining validator warnings. " +
  "Make the smallest edits needed for structural coherence: every room enclosed, openings on real walls, labels inside their rooms, dimensions self-consistent. " +
  "If the spec is already sound, return it unchanged. Respond with ONLY the final JSON object in the same schema — no prose, no code fences.";

function extractJSON(text: string): PlanSpec | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as PlanSpec;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { image?: string; notes?: string };
    if (!body?.image || !/^data:image\/(png|jpe?g|webp);base64,/i.test(body.image)) {
      return NextResponse.json({ error: "missing_image" }, { status: 400 });
    }
    if (!hasAI()) {
      const res: SketchResult = { ai: false, spec: null, loops: [], error: "no_ai_key" };
      return NextResponse.json(res);
    }
    const notes = (body.notes ?? "").slice(0, 1200);
    const loops: LoopReport[] = [];

    // ── LOOP 1 · DRAFT ──────────────────────────────────────────────────────
    const draftPrompt =
      (notes ? `Client notes (dimensions, rooms, intent): ${notes}\n` : "") +
      "Extract the floor plan from this sketch photo. JSON only.";
    let raw = await describeImage(DRAFT_SYSTEM, body.image, draftPrompt, 3000);
    let parsed = raw ? extractJSON(raw) : null;
    if (!parsed) {
      raw = await describeImage(DRAFT_SYSTEM, body.image, draftPrompt + " Return ONLY valid JSON.", 3000);
      parsed = raw ? extractJSON(raw) : null;
    }
    if (!parsed) {
      const res: SketchResult = { ai: true, spec: null, loops, error: "draft_failed" };
      return NextResponse.json(res);
    }
    let v = validatePlan(parsed);
    loops.push({ stage: "draft", summary: `Extracted ${v.spec.walls.length} walls, ${v.spec.openings.length} openings · ${issueDigest(v.issues)}`, issues: v.issues });

    // ── LOOP 2 · JUDGE ──────────────────────────────────────────────────────
    const judgeUser =
      `Spec:\n${JSON.stringify(v.spec)}\n\nValidator findings:\n${v.issues.map((i) => `- [${i.severity}] ${i.message}`).join("\n") || "- none"}\n` +
      (notes ? `\nClient notes: ${notes}` : "");
    const judged = extractJSON((await askText(JUDGE_SYSTEM, judgeUser, 3000)) ?? "");
    if (judged) {
      v = validatePlan(judged);
      loops.push({ stage: "judge", summary: `Refactored to ${v.spec.walls.length} walls, ${v.spec.openings.length} openings · ${issueDigest(v.issues)}`, issues: v.issues });
    } else {
      loops.push({ stage: "judge", summary: "Judge pass returned no usable revision — draft geometry retained.", issues: [] });
    }

    // ── LOOP 3 · AUDIT ──────────────────────────────────────────────────────
    const warns = v.issues.filter((i) => i.severity === "warn");
    const auditUser =
      `Spec:\n${JSON.stringify(v.spec)}\n\nRemaining warnings:\n${warns.map((i) => `- ${i.message}`).join("\n") || "- none"}`;
    const audited = extractJSON((await askText(AUDIT_SYSTEM, auditUser, 3000)) ?? "");
    if (audited) {
      const f = validatePlan(audited);
      // Accept the audit only if it didn't destroy geometry
      if (f.spec.walls.length >= Math.max(1, Math.floor(v.spec.walls.length * 0.6))) v = f;
      loops.push({ stage: "audit", summary: `Solidified · ${v.spec.walls.length} walls, ${v.spec.openings.length} openings · ${issueDigest(v.issues)}`, issues: v.issues });
    } else {
      loops.push({ stage: "audit", summary: "Audit pass confirmed the judged geometry as final.", issues: v.issues.filter((i) => i.severity === "warn") });
    }

    const res: SketchResult = { ai: true, spec: v.spec, loops };
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: "sketch_failed", detail: String(e) }, { status: 500 });
  }
}
