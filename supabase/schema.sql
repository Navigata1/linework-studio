-- Linework Studio — Supabase schema.
-- Apply via the Supabase SQL editor or `supabase db push`.
-- The app runs without this (best-effort persistence); add it to durably store
-- intake requests, report metadata, and dossier lookups.

create table if not exists public.intake_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  project_type text,
  dimensions text,
  deadline text,
  budget text,
  description text not null,
  status text not null default 'new'
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

-- Row Level Security: lock down by default. The service-role key used by the
-- server routes bypasses RLS; anon clients get no direct access.
alter table public.intake_requests enable row level security;
alter table public.reports enable row level security;
alter table public.dossiers enable row level security;
