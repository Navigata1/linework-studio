// Deterministic geometry audit + solidification. Runs between every AI loop so
// the pipeline never converges on incoherent linework: angles are snapped
// square, nearly-touching endpoints are welded, impossible openings are
// clamped or dropped, and anything it can't safely fix is reported as a
// warning for the judge/audit loops (and ultimately Jasmine) to resolve.

import { type PlanSpec, type AuditIssue, type Pt, DEFAULT_WALL_T } from "./types";

const SNAP_ANGLE_DEG = 7; // walls within 7° of square get squared
const WELD_DIST = 0.5; // ft — endpoints closer than this are the same corner
const MIN_WALL = 0.8; // ft — anything shorter is sketch noise
const MAX_EXTENT = 600; // ft — beyond this the units are wrong

const d = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export function validatePlan(input: PlanSpec): { spec: PlanSpec; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  const fixed = (message: string) => issues.push({ severity: "fixed", message });
  const warn = (message: string) => issues.push({ severity: "warn", message });

  const spec: PlanSpec = {
    units: input.units === "m" ? "m" : "ft",
    name: typeof input.name === "string" ? input.name.slice(0, 80) : undefined,
    walls: [],
    openings: [],
    labels: [],
    notes: Array.isArray(input.notes) ? input.notes.filter((n) => typeof n === "string").slice(0, 12) : [],
  };

  // ── 1. Walls: sanitize, drop noise, square-up ────────────────────────────
  const rawWalls = Array.isArray(input.walls) ? input.walls : [];
  const wallMap: number[] = []; // original index → new index (-1 dropped)
  for (let i = 0; i < rawWalls.length; i++) {
    const w = rawWalls[i];
    const ok =
      w && Array.isArray(w.a) && Array.isArray(w.b) &&
      [w.a[0], w.a[1], w.b[0], w.b[1]].every((n) => typeof n === "number" && isFinite(n));
    if (!ok) { wallMap[i] = -1; fixed(`Wall ${i + 1}: malformed coordinates — removed.`); continue; }
    let a: Pt = [w.a[0], w.a[1]];
    let b: Pt = [w.b[0], w.b[1]];
    if (d(a, b) < MIN_WALL) { wallMap[i] = -1; fixed(`Wall ${i + 1}: shorter than ${MIN_WALL} ${spec.units} — removed as sketch noise.`); continue; }

    // square-up: snap near-orthogonal walls to exactly 0°/90°
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const mod = ((ang % 90) + 90) % 90;
    const off = Math.min(mod, 90 - mod);
    if (off > 0.01 && off <= SNAP_ANGLE_DEG) {
      const len = d(a, b);
      const snapped = Math.round(ang / 90) * 90;
      const rad = (snapped * Math.PI) / 180;
      b = [a[0] + Math.cos(rad) * len, a[1] + Math.sin(rad) * len];
      fixed(`Wall ${i + 1}: squared from ${ang.toFixed(1)}° to ${snapped}°.`);
    } else if (off > SNAP_ANGLE_DEG && off < 90 - SNAP_ANGLE_DEG && off > 12) {
      // genuinely angled wall — legal, just note it
      warn(`Wall ${i + 1} is intentionally non-orthogonal (${ang.toFixed(1)}°) — verify against the sketch.`);
    }

    const t = typeof w.t === "number" && w.t > 0.1 && w.t < 3 ? w.t : DEFAULT_WALL_T;
    wallMap[i] = spec.walls.length;
    spec.walls.push({ a, b, t });
  }

  // ── 2. Weld: endpoints within WELD_DIST collapse to one corner ───────────
  const pts: Pt[] = [];
  const canon = (p: Pt): Pt => {
    for (const q of pts) if (d(p, q) < WELD_DIST) return q;
    pts.push(p);
    return p;
  };
  let welds = 0;
  for (const w of spec.walls) {
    const a2 = canon(w.a), b2 = canon(w.b);
    if (a2 !== w.a || b2 !== w.b) welds++;
    w.a = a2; w.b = b2;
  }
  if (welds) fixed(`Welded ${welds} near-miss corner${welds > 1 ? "s" : ""} (tolerance ${WELD_DIST} ${spec.units}).`);

  // dedupe identical walls
  const seen = new Set<string>();
  spec.walls = spec.walls.filter((w, i) => {
    const k1 = `${w.a}|${w.b}`, k2 = `${w.b}|${w.a}`;
    if (seen.has(k1) || seen.has(k2)) { fixed(`Wall ${i + 1}: duplicate segment removed.`); return false; }
    seen.add(k1);
    return true;
  });

  // ── 3. Extents sanity ─────────────────────────────────────────────────────
  if (spec.walls.length) {
    const xs = spec.walls.flatMap((w) => [w.a[0], w.b[0]]);
    const ys = spec.walls.flatMap((w) => [w.a[1], w.b[1]]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    if (span > MAX_EXTENT) warn(`Plan spans ${span.toFixed(0)} ${spec.units} — units look wrong for a building.`);
    if (span < 6) warn(`Plan spans only ${span.toFixed(1)} ${spec.units} — dimensions may be missing scale.`);
  } else {
    warn("No usable walls were extracted.");
  }

  // ── 4. Topology: open ends break rooms ────────────────────────────────────
  // An endpoint is "supported" if it meets another wall's endpoint (degree ≥ 2)
  // OR lands on another wall's span (a T-junction — how interior partitions
  // meet exterior walls). Only genuinely dangling ends are worth a warning.
  const degree = new Map<Pt, number>();
  for (const w of spec.walls) {
    degree.set(w.a, (degree.get(w.a) ?? 0) + 1);
    degree.set(w.b, (degree.get(w.b) ?? 0) + 1);
  }
  const onSomeWall = (p: Pt): boolean => {
    for (const w of spec.walls) {
      if (w.a === p || w.b === p) continue;
      const len = d(w.a, w.b);
      if (len < 0.01) continue;
      const ux = (w.b[0] - w.a[0]) / len, uy = (w.b[1] - w.a[1]) / len;
      const s = (p[0] - w.a[0]) * ux + (p[1] - w.a[1]) * uy;
      if (s < -WELD_DIST || s > len + WELD_DIST) continue;
      const px = w.a[0] + ux * s, py = w.a[1] + uy * s;
      if (Math.hypot(p[0] - px, p[1] - py) < WELD_DIST + (w.t ?? DEFAULT_WALL_T) / 2) return true;
    }
    return false;
  };
  let openEnds = 0;
  for (const [p, n] of degree) if (n === 1 && !onSomeWall(p)) openEnds++;
  if (openEnds > 0) warn(`${openEnds} open wall end${openEnds > 1 ? "s" : ""} — enclosure may not be closed; verify the loop.`);

  // ── 5. Openings: remap, clamp, drop impossible ────────────────────────────
  const rawOpenings = Array.isArray(input.openings) ? input.openings : [];
  for (let i = 0; i < rawOpenings.length; i++) {
    const o = rawOpenings[i];
    if (!o || typeof o.wall !== "number" || typeof o.at !== "number" || typeof o.w !== "number") {
      fixed(`Opening ${i + 1}: malformed — removed.`);
      continue;
    }
    const wi = wallMap[o.wall] ?? -1;
    const wall = spec.walls[wi];
    if (!wall) { fixed(`Opening ${i + 1}: referenced a removed wall — dropped.`); continue; }
    const len = d(wall.a, wall.b);
    let w2 = Math.min(Math.max(o.w, 1), Math.max(1, len - 0.5));
    if (w2 !== o.w) fixed(`Opening ${i + 1}: width ${o.w} clamped to ${w2.toFixed(2)} to fit its wall.`);
    if (w2 >= len - 0.4) { fixed(`Opening ${i + 1}: wider than its wall — dropped.`); continue; }
    let at = o.at;
    const half = w2 / 2;
    if (at - half < 0.2) { at = half + 0.2; fixed(`Opening ${i + 1}: shifted off the wall start.`); }
    if (at + half > len - 0.2) { at = len - half - 0.2; fixed(`Opening ${i + 1}: shifted off the wall end.`); }
    const type = o.type === "door" || o.type === "window" ? o.type : "opening";
    spec.openings.push({ wall: wi, type, at, w: w2, swing: o.swing === "right" ? "right" : "left" });
  }

  // overlapping openings on the same wall
  const byWall = new Map<number, { at: number; w: number }[]>();
  for (const o of spec.openings) {
    const list = byWall.get(o.wall) ?? [];
    for (const p of list) {
      if (Math.abs(p.at - o.at) < (p.w + o.w) / 2) warn(`Two openings overlap on wall ${o.wall + 1} — verify against the sketch.`);
    }
    list.push({ at: o.at, w: o.w });
    byWall.set(o.wall, list);
  }

  // ── 6. Labels ─────────────────────────────────────────────────────────────
  const rawLabels = Array.isArray(input.labels) ? input.labels : [];
  for (const l of rawLabels) {
    if (l && Array.isArray(l.at) && typeof l.at[0] === "number" && typeof l.at[1] === "number" && typeof l.text === "string" && l.text.trim()) {
      spec.labels.push({ at: [l.at[0], l.at[1]], text: l.text.trim().slice(0, 40).toUpperCase() });
    }
  }

  return { spec, issues };
}

/** Compact one-line report used in loop prompts and the UI. */
export function issueDigest(issues: AuditIssue[]): string {
  const f = issues.filter((i) => i.severity === "fixed").length;
  const w = issues.filter((i) => i.severity === "warn").length;
  return `${f} auto-fixed · ${w} warning${w === 1 ? "" : "s"}`;
}
