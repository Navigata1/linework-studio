// Shared shapes for Sketch → CAD. A PlanSpec is the structured "truth" the
// pipeline converges on: the AI loops propose it, the deterministic validator
// repairs it, and the DXF writer renders it as native CAD linework.

export type Pt = [number, number]; // plan coordinates in `units`

export type Wall = {
  a: Pt;
  b: Pt;
  /** wall thickness in plan units (default 0.5 ft) */
  t?: number;
};

export type Opening = {
  /** index into walls[] */
  wall: number;
  type: "door" | "window" | "opening";
  /** distance from wall endpoint `a` to the opening CENTER, along the wall */
  at: number;
  /** opening width */
  w: number;
  /** door swing side relative to wall direction (left of a→b = "left") */
  swing?: "left" | "right";
};

export type Label = { at: Pt; text: string };

export type PlanSpec = {
  units: "ft" | "m";
  name?: string;
  walls: Wall[];
  openings: Opening[];
  labels: Label[];
  /** free-form assumptions/notes the AI wants the drafter to verify */
  notes?: string[];
};

export type AuditIssue = {
  severity: "fixed" | "warn";
  message: string;
};

export type LoopReport = {
  stage: "draft" | "judge" | "audit";
  summary: string;
  issues: AuditIssue[];
};

export type SketchResult = {
  ai: boolean;
  spec: PlanSpec | null;
  loops: LoopReport[];
  error?: string;
};

export const DEFAULT_WALL_T = 0.5; // ft — nominal 6" wall

/** A small demo plan so the tool is fully explorable before AI keys are set. */
export const SAMPLE_PLAN: PlanSpec = {
  units: "ft",
  name: "Sample — Garage Conversion",
  walls: [
    { a: [0, 0], b: [24, 0] },
    { a: [24, 0], b: [24, 20] },
    { a: [24, 20], b: [0, 20] },
    { a: [0, 20], b: [0, 0] },
    { a: [14, 0], b: [14, 12], t: 0.375 },
    { a: [14, 12], b: [24, 12], t: 0.375 },
  ],
  openings: [
    { wall: 0, type: "door", at: 4, w: 3, swing: "left" },
    { wall: 2, type: "window", at: 6, w: 4 },
    { wall: 2, type: "window", at: 17, w: 4 },
    { wall: 4, type: "door", at: 9, w: 2.67, swing: "right" },
    { wall: 1, type: "window", at: 6, w: 3 },
  ],
  labels: [
    { at: [7, 10], text: "LIVING" },
    { at: [19, 6], text: "BEDROOM" },
    { at: [19, 16], text: "BATH" },
  ],
  notes: ["Sample plan — replace with a photographed sketch."],
};
