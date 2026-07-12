import { StudioShell } from "@/components/studio/StudioShell";
import { DossierForm } from "@/components/dossier/DossierForm";

export const metadata = { title: "Site Dossier · Linework Studios" };

export default function DossierPage() {
  return (
    <StudioShell active="dossier">
      <div className="container-studio py-12">
        <div className="border-b border-[var(--color-line)] pb-6">
          <p className="eyebrow" style={{ color: "var(--color-cyan)" }}>WS-03 · Site Dossier</p>
          <h1 className="mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)]">Address in. Site picture out.</h1>
          <p className="mt-3 max-w-[64ch] text-[var(--color-dim)]">
            The two-day hunt across county systems, collapsed to a coffee break — from Sacramento
            and the Bay Area down to LA. Parcel jurisdiction,
            record sources, an AI research brief, and a field checklist — cited and ready to file.
          </p>
        </div>
        <div className="mt-10">
          <DossierForm />
        </div>
      </div>
    </StudioShell>
  );
}
