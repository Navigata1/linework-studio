import { StudioShell } from "@/components/studio/StudioShell";
import { SketchStudio } from "@/components/sketch/SketchStudio";

export const metadata = { title: "Sketch → CAD · Linework Studios" };

export default function SketchPage() {
  return (
    <StudioShell active="sketch">
      <section className="container-studio py-12">
        <p className="eyebrow">WS-04 · Sketch → CAD</p>
        <h1 className="mt-3 max-w-[24ch] text-[clamp(1.8rem,3.6vw,2.8rem)]">
          Photo of a sketch in. Layered DXF out.
        </h1>
        <p className="mt-4 max-w-[64ch] text-[var(--color-dim)]">
          Three loops — draft, judge, audit — extract the plan, repair its geometry against a
          deterministic validator, and solidify it into clean orthogonal linework. The DXF opens
          native in AutoCAD as a working base; the engineer&apos;s judgment finishes the sheet.
        </p>
        <div className="mt-10">
          <SketchStudio />
        </div>
      </section>
    </StudioShell>
  );
}
