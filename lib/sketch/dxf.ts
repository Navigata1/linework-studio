// PlanSpec → DXF (AutoCAD R12 ASCII — the most universally importable flavor).
// Pure string assembly, zero dependencies, runs in the browser so the drawing
// downloads instantly and the plan never has to leave the device to become CAD.
//
// Layer schedule (ACI colors):
//   A-WALL  (7 white)  — double-line walls with end caps, gapped at openings
//   A-DOOR  (4 cyan)   — door leaves + 90° swing arcs
//   A-GLAZ  (5 blue)   — window sill/face/center lines
//   A-ANNO  (2 yellow) — room labels
//   A-DIMS  (8 grey)   — per-wall lengths + overall extents
//   A-TTLB  (7 white)  — title text

import { type PlanSpec, type Pt, DEFAULT_WALL_T } from "./types";

const g = (code: number, value: string | number) => `${code}\n${value}\n`;
const fmt = (n: number) => (Math.round(n * 10000) / 10000).toString();

function line(layer: string, a: Pt, b: Pt): string {
  return g(0, "LINE") + g(8, layer) + g(10, fmt(a[0])) + g(20, fmt(a[1])) + g(30, 0) + g(11, fmt(b[0])) + g(21, fmt(b[1])) + g(31, 0);
}
function arc(layer: string, c: Pt, r: number, a0: number, a1: number): string {
  return g(0, "ARC") + g(8, layer) + g(10, fmt(c[0])) + g(20, fmt(c[1])) + g(30, 0) + g(40, fmt(r)) + g(50, fmt(a0)) + g(51, fmt(a1));
}
function text(layer: string, at: Pt, h: number, value: string, rotDeg = 0, centered = true): string {
  let e = g(0, "TEXT") + g(8, layer) + g(10, fmt(at[0])) + g(20, fmt(at[1])) + g(30, 0) + g(40, fmt(h)) + g(1, value);
  if (rotDeg) e += g(50, fmt(rotDeg));
  if (centered) e += g(72, 1) + g(11, fmt(at[0])) + g(21, fmt(at[1])) + g(31, 0); // center-justified
  return e;
}

const layerDef = (name: string, color: number) =>
  g(0, "LAYER") + g(2, name) + g(70, 0) + g(62, color) + g(6, "CONTINUOUS");

export function planToDxf(spec: PlanSpec): string {
  let ents = "";
  const unit = spec.units;
  const th = 0.55; // annotation text height (plan units)

  // ── walls: centerline → two offset faces, split at openings, capped ──────
  spec.walls.forEach((w, wi) => {
    const t = w.t ?? DEFAULT_WALL_T;
    const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
    if (len < 0.01) return;
    const ux = (w.b[0] - w.a[0]) / len, uy = (w.b[1] - w.a[1]) / len; // along
    const nx = -uy, ny = ux; // normal (left of a→b)
    const off = t / 2;

    // segments of the centerline not covered by an opening
    const cuts = spec.openings
      .filter((o) => o.wall === wi)
      .map((o) => [o.at - o.w / 2, o.at + o.w / 2] as [number, number])
      .sort((a, b) => a[0] - b[0]);
    const segs: [number, number][] = [];
    let cur = 0;
    for (const [s0, s1] of cuts) {
      if (s0 > cur + 0.01) segs.push([cur, s0]);
      cur = Math.max(cur, s1);
    }
    if (cur < len - 0.01) segs.push([cur, len]);
    if (!segs.length) segs.push([0, len]);

    const P = (s: number, side: 1 | -1 | 0): Pt => [w.a[0] + ux * s + nx * off * side, w.a[1] + uy * s + ny * off * side];
    for (const [s0, s1] of segs) {
      ents += line("A-WALL", P(s0, 1), P(s1, 1));
      ents += line("A-WALL", P(s0, -1), P(s1, -1));
      ents += line("A-WALL", P(s0, 1), P(s0, -1)); // cap
      ents += line("A-WALL", P(s1, 1), P(s1, -1)); // cap
    }

    // per-wall length annotation (DIMS)
    if (len >= 3) {
      const mid: Pt = [w.a[0] + ux * (len / 2) + nx * (off + 0.9), w.a[1] + uy * (len / 2) + ny * (off + 0.9)];
      let rot = (Math.atan2(uy, ux) * 180) / Math.PI;
      if (rot > 90 || rot <= -90) rot += 180; // keep text readable
      ents += text("A-DIMS", mid, th * 0.8, formatLen(len, unit), rot);
    }

    // openings on this wall
    for (const o of spec.openings.filter((o) => o.wall === wi)) {
      const c: Pt = [w.a[0] + ux * o.at, w.a[1] + uy * o.at];
      const h0: Pt = [c[0] - ux * (o.w / 2), c[1] - uy * (o.w / 2)];
      const h1: Pt = [c[0] + ux * (o.w / 2), c[1] + uy * (o.w / 2)];
      if (o.type === "door") {
        const side = o.swing === "right" ? -1 : 1;
        const leafEnd: Pt = [h0[0] + nx * o.w * side, h0[1] + ny * o.w * side];
        ents += line("A-DOOR", h0, leafEnd); // leaf
        const a0 = (Math.atan2(uy, ux) * 180) / Math.PI;
        const start = side === 1 ? a0 : a0 - 90;
        ents += arc("A-DOOR", h0, o.w, start, start + 90); // swing
        ents += line("A-DOOR", h1, [h1[0], h1[1]]); // stop tick (degenerate-safe)
      } else if (o.type === "window") {
        const off2 = (w.t ?? DEFAULT_WALL_T) / 2;
        ents += line("A-GLAZ", [h0[0] + nx * off2, h0[1] + ny * off2], [h1[0] + nx * off2, h1[1] + ny * off2]);
        ents += line("A-GLAZ", [h0[0] - nx * off2, h0[1] - ny * off2], [h1[0] - nx * off2, h1[1] - ny * off2]);
        ents += line("A-GLAZ", h0, h1); // center glazing line
        ents += line("A-GLAZ", [h0[0] + nx * off2, h0[1] + ny * off2], [h0[0] - nx * off2, h0[1] - ny * off2]);
        ents += line("A-GLAZ", [h1[0] + nx * off2, h1[1] + ny * off2], [h1[0] - nx * off2, h1[1] - ny * off2]);
      }
      // plain "opening": the wall gap itself is the symbol
    }
  });

  // ── labels ────────────────────────────────────────────────────────────────
  for (const l of spec.labels) ents += text("A-ANNO", l.at, th, l.text);

  // ── overall extents ───────────────────────────────────────────────────────
  if (spec.walls.length) {
    const xs = spec.walls.flatMap((w) => [w.a[0], w.b[0]]);
    const ys = spec.walls.flatMap((w) => [w.a[1], w.b[1]]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const dy = y0 - 2.2, dx = x0 - 2.2;
    ents += line("A-DIMS", [x0, dy], [x1, dy]);
    ents += line("A-DIMS", [x0, dy - 0.3], [x0, dy + 0.3]);
    ents += line("A-DIMS", [x1, dy - 0.3], [x1, dy + 0.3]);
    ents += text("A-DIMS", [(x0 + x1) / 2, dy + 0.5], th * 0.85, formatLen(x1 - x0, unit));
    ents += line("A-DIMS", [dx, y0], [dx, y1]);
    ents += line("A-DIMS", [dx - 0.3, y0], [dx + 0.3, y0]);
    ents += line("A-DIMS", [dx - 0.3, y1], [dx + 0.3, y1]);
    ents += text("A-DIMS", [dx - 0.5, (y0 + y1) / 2], th * 0.85, formatLen(y1 - y0, unit), 90);
    // title block line
    ents += text("A-TTLB", [(x0 + x1) / 2, dy - 1.6], th * 0.9, `${(spec.name ?? "FLOOR PLAN").toUpperCase()} · LINEWORK STUDIOS · DRAFTED BY JJ`);
  }

  return (
    g(0, "SECTION") + g(2, "HEADER") +
    g(9, "$ACADVER") + g(1, "AC1009") +
    g(0, "ENDSEC") +
    g(0, "SECTION") + g(2, "TABLES") +
    g(0, "TABLE") + g(2, "LAYER") + g(70, 6) +
    layerDef("A-WALL", 7) + layerDef("A-DOOR", 4) + layerDef("A-GLAZ", 5) +
    layerDef("A-ANNO", 2) + layerDef("A-DIMS", 8) + layerDef("A-TTLB", 7) +
    g(0, "ENDTAB") + g(0, "ENDSEC") +
    g(0, "SECTION") + g(2, "ENTITIES") +
    ents +
    g(0, "ENDSEC") + g(0, "EOF")
  );
}

function formatLen(len: number, unit: "ft" | "m"): string {
  if (unit === "m") return `${(Math.round(len * 100) / 100).toFixed(2)} m`;
  const ft = Math.floor(len);
  const inch = Math.round((len - ft) * 12);
  return inch === 0 ? `${ft}'-0"` : inch === 12 ? `${ft + 1}'-0"` : `${ft}'-${inch}"`;
}
