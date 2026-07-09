// Shared form primitives used across Report, Dossier, and Intake.
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-sm border border-[var(--color-line-2)] bg-[var(--color-void)] px-3 py-2.5 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-faint)] outline-none transition-colors focus:border-[var(--color-blue)]";

export function Label({ children }: { children: React.ReactNode }) {
  return <span className="mono mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[var(--color-faint)]">{children}</span>;
}

export function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input {...props} className={base} />
    </label>
  );
}

export function Area({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea {...props} className={`${base} min-h-[92px] resize-y leading-relaxed`} />
    </label>
  );
}
