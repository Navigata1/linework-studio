import { StudioShell } from "@/components/studio/StudioShell";
import { DropZone } from "@/components/report/DropZone";

export const metadata = { title: "Report Engine · Brain Loft Studios" };

export default function ReportPage() {
  return (
    <StudioShell active="report">
      <div className="container-studio py-12">
        <div className="border-b border-[var(--color-line)] pb-6">
          <p className="eyebrow" style={{ color: "var(--color-blue)" }}>WS-01 · Report Engine</p>
          <h1 className="mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)]">Photos in. Word doc out.</h1>
          <p className="mt-3 max-w-[64ch] text-[var(--color-dim)]">
            Set your header once and save it as a preset. Drop a day's photos — the studio pulls
            date, time and GPS from each, drafts an activity description, and renders your exact
            inspector report as a fully editable Word document.
          </p>
        </div>
        <div className="mt-10">
          <DropZone />
        </div>
      </div>
    </StudioShell>
  );
}
