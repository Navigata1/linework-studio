# Brain Loft Studios

Jasmine Johnson's civil-engineering operating system — the public studio site plus
three working tools under one roof.

- **Report Engine** (`/studio/report`) — drop site photos → EXIF fills date/time/GPS →
  AI drafts each activity description → export the daily inspector report as an editable `.docx`.
- **Site Dossier** (`/studio/dossier`) — address/APN in → parcel jurisdiction, record
  sources, AI research brief, and a field checklist out, exportable to Word.
- **Client Intake** (`/hire`) — the storefront: structured CAD requests land as clean,
  quotable briefs (Supabase + email), not Fiverr overhead.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · `docx` · `exifr`.
Optional integrations: Anthropic (AI drafting), Supabase (persistence),
Resend (intake email), Regrid (parcel data). **All optional** — the app builds and
runs with zero secrets and lights up feature-by-feature as keys are added (see `.env.example`).

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```

## Deploy

Deploys to Vercel as-is. Add environment variables from `.env.example` in the Vercel
dashboard to enable AI, persistence, and email. Apply `supabase/schema.sql` to the
Supabase project for durable storage.

Built by the Island Development Crew. 💎
