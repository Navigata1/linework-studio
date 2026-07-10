-- Linework Studio — Supabase schema (v2).
-- Apply via the Supabase SQL editor or MCP apply_migration.
-- The app runs without this (best-effort persistence); with it, the studio
-- gains a durable Requests Inbox, report history, and dossier archive.

create table if not exists public.intake_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  project_type text,
  dimensions text,
  deadline text,
  budget text,
  description text not null,
  status text not null default 'new'
    check (status in ('new','quoted','in_progress','delivered','archived')),
  notes text
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contract_no text,
  report_no text,
  report_date text,
  inspector text,
  photo_count int default 0
);

create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  query text,
  county text
);

-- Inbox is read newest-first, filtered by status.
create index if not exists intake_requests_created_idx on public.intake_requests (created_at desc);
create index if not exists intake_requests_status_idx on public.intake_requests (status);
create index if not exists reports_created_idx on public.reports (created_at desc);
create index if not exists dossiers_created_idx on public.dossiers (created_at desc);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists intake_touch on public.intake_requests;
create trigger intake_touch before update on public.intake_requests
  for each row execute function public.touch_updated_at();

-- Row Level Security: locked down by default. The server routes use the
-- service-role key (bypasses RLS); anon/publishable clients get nothing.
alter table public.intake_requests enable row level security;
alter table public.reports enable row level security;
alter table public.dossiers enable row level security;
