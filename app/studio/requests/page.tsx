import { StudioShell } from "@/components/studio/StudioShell";
import { hasSupabase, serverClient } from "@/lib/supabase";

export const metadata = { title: "Requests · Linework Studio" };
export const dynamic = "force-dynamic";

type Intake = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  dimensions: string | null;
  deadline: string | null;
  budget: string | null;
  description: string;
  status: string;
};

const STATUS_COLOR: Record<string, string> = {
  new: "var(--color-amber)",
  quoted: "var(--color-blue)",
  in_progress: "var(--color-cyan)",
  delivered: "var(--color-good)",
  archived: "var(--color-faint)",
};

async function fetchRequests(): Promise<Intake[] | null> {
  if (!hasSupabase()) return null;
  try {
    const sb = serverClient();
    const { data, error } = await sb!
      .from("intake_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return null;
    return (data as Intake[]) ?? [];
  } catch {
    return null;
  }
}

export default async function RequestsPage() {
  const requests = await fetchRequests();

  return (
    <StudioShell active="requests">
      <div className="container-studio py-12">
        <div className="border-b border-[var(--color-line)] pb-6">
          <p className="eyebrow" style={{ color: "var(--color-amber)" }}>Inbox · client requests</p>
          <h1 className="mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)]">Every brief, in one place.</h1>
          <p className="mt-3 max-w-[64ch] text-[var(--color-dim)]">
            Submissions from the <span className="mono text-[13px]">/hire</span> intake land here —
            newest first, each one already structured and quotable.
          </p>
        </div>

        {requests === null && (
          <div className="grid-fine mt-10 border border-dashed border-[var(--color-line-2)] p-10 text-center">
            <p className="mono text-[11px] tracking-[0.2em] text-[var(--color-amber)]">STORAGE NOT CONNECTED</p>
            <p className="mx-auto mt-4 max-w-[52ch] text-[14px] text-[var(--color-dim)]">
              The inbox lights up when Supabase is connected. Until then, intake submissions are
              still received and logged server-side — nothing is lost. Connect by adding
              <span className="mono text-[12px] text-[var(--color-ink)]"> NEXT_PUBLIC_SUPABASE_URL</span> and
              <span className="mono text-[12px] text-[var(--color-ink)]"> SUPABASE_SERVICE_ROLE_KEY</span> in
              Vercel, then applying <span className="mono text-[12px] text-[var(--color-ink)]">supabase/schema.sql</span>.
            </p>
          </div>
        )}

        {requests !== null && requests.length === 0 && (
          <div className="grid-fine mt-10 border border-dashed border-[var(--color-line-2)] p-10 text-center">
            <p className="mono text-[11px] tracking-[0.2em] text-[var(--color-good)]">CONNECTED · INBOX EMPTY</p>
            <p className="mx-auto mt-4 max-w-[46ch] text-[14px] text-[var(--color-dim)]">
              No requests yet. Text the <span className="mono text-[12px] text-[var(--color-ink)]">/hire</span> link
              to someone who needs drawings — their brief will appear here the moment they send it.
            </p>
          </div>
        )}

        {requests !== null && requests.length > 0 && (
          <div className="mt-10 space-y-3">
            {requests.map((r) => (
              <details key={r.id} className="group border border-[var(--color-line)] bg-[var(--color-panel)]">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 [&::-webkit-details-marker]:hidden">
                  <span
                    className="mono rounded-sm border px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em]"
                    style={{ color: STATUS_COLOR[r.status] ?? "var(--color-dim)", borderColor: STATUS_COLOR[r.status] ?? "var(--color-line-2)" }}
                  >
                    {r.status.replace("_", " ")}
                  </span>
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-[13px] text-[var(--color-dim)]">{r.project_type ?? "General request"}</span>
                  <span className="mono ml-auto text-[11px] text-[var(--color-faint)]">
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {r.budget ? ` · ${r.budget}` : ""}
                  </span>
                </summary>
                <div className="border-t border-[var(--color-line)] px-6 py-5">
                  <p className="max-w-[80ch] whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-ink)]">{r.description}</p>
                  <div className="mono mt-4 grid gap-2 text-[11.5px] text-[var(--color-dim)] sm:grid-cols-2 lg:grid-cols-4">
                    <span>EMAIL · <a className="text-[var(--color-blue)]" href={`mailto:${r.email}`}>{r.email}</a></span>
                    {r.phone && <span>PHONE · {r.phone}</span>}
                    {r.dimensions && <span>DIMS · {r.dimensions}</span>}
                    {r.deadline && <span>DEADLINE · {r.deadline}</span>}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </StudioShell>
  );
}
