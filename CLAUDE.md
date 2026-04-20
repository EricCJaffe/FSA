# BusinessOS — FSA (Property Intelligence Platform)

## Build & Development Commands
- `npm run dev` — local dev server (Next.js)
- `npm run build` — production build
- `npm run lint` — ESLint
- TypeScript scripts: `npx tsx scripts/<name>.ts`

## Tech Stack
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS
- Supabase (auth, Postgres + RLS, edge functions)
- `@supabase/ssr` for server/client session management
- Vercel for deployment (auto-deploys on push to `main`)
- GitHub: `EricCJaffe/FSA`

## Doc Maintenance Rules
When making changes, update the relevant docs **in the same commit**:

| Change type | Update |
|---|---|
| Major architectural decision | New ADR in `docs/DECISIONS/NNNN-<slug>.md` |
| New or changed feature | `docs/TASKS.md` (mark done or add new) |
| New integration or service | `docs/INTEGRATIONS.md` |
| New env var or secret | `docs/ENVIRONMENT.md` |
| Workflow or process change | `docs/WORKFLOWS.md` or `docs/RUNBOOK.md` |
| Release or deployment | `docs/RELEASES.md` |
| Security change | `docs/SECURITY.md` |
| API change | `docs/API.md` |
| Supabase schema or edge function change | `docs/SUPABASE.md` |

## Code Conventions
- **Server Components by default** — only add `'use client'` when interactivity or browser APIs are required
- **Supabase server client** (`src/lib/supabase/server.ts`) in Server Components and Route Handlers
- **Supabase browser client** (`src/lib/supabase/client.ts`) in Client Components only
- **Server Actions** for all data mutations — never raw `fetch()` to internal APIs from components
- **Never put secrets** (service role key, QBO client secret, API keys) in `NEXT_PUBLIC_*` env vars
- Route protection via middleware (`src/middleware.ts`) — `/dashboard/**` requires auth
- Audit log all financial data access and mutations
- RBAC enforced at DB layer (RLS) **and** in Server Actions — never trust client-sent role claims

## Project Structure
```
src/
├── app/                # Next.js App Router
│   ├── (auth)/         # Login, callback routes
│   ├── (dashboard)/    # Protected app routes
│   └── api/            # Route handlers (webhooks, QBO OAuth)
├── components/         # React components (ui/, layout/, property/, dashboard/)
├── lib/
│   ├── supabase/       # client.ts, server.ts, middleware.ts
│   ├── qbo/            # QuickBooks API client (Phase 1)
│   └── ai/             # AI insights engine (Phase 1)
├── hooks/              # Custom React hooks
└── types/              # Shared TypeScript types
supabase/
├── functions/          # Edge functions
└── migrations/         # SQL migrations (named YYYYMMDDHHMMSS_<slug>.sql)
docs/                   # All project documentation
scripts/                # One-off and utility scripts
```

## Security Rules
- Financial data — treat with same care as PHI: no logging of raw values, no client exposure
- **Never** put QBO tokens, service role keys, or AI API keys in `NEXT_PUBLIC_*` vars
- QBO OAuth tokens stored server-side only (Supabase `qbo_connections` table, ideally Vault)
- RBAC: 4-tier model (family_office_admin → org_admin → org_viewer → advisor)
- RLS enabled on all tables — verify policies before every migration
- Audit log (`audit_log` table) for all write operations on financial data
- Run `npm run build` before committing to catch type/compile errors

## Daily Workflow Prompts (for the developer)

### Starting your day (new machine or new session)
Say one of these:
> "Pull latest and get up to speed"

or

> "Start of day — pull latest from main, read the project docs, and tell me where we left off"

This tells Claude to:
1. `git pull origin main` to get the latest code
2. Read `docs/CONTEXT.md`, `docs/ENVIRONMENT.md`, `docs/TASKS.md`, `docs/RUNBOOK.md`
3. Summarize what's in progress and what's next

### Ending your day (closing out a session)
Say one of these:
> "End of day — commit, push, and update tasks"

or

> "Close out for the day"

This tells Claude to:
1. Update `docs/TASKS.md` with completed and newly discovered work
2. Commit all changes with clear messages
3. Push to the working branch
4. Give a summary of what was done and what's next

## On Session Start (Claude instructions)
Read these docs automatically before doing any work:
1. `docs/CONTEXT.md` — purpose, platform hierarchy, module scope
2. `docs/ENVIRONMENT.md` — env vars and secrets map
3. `docs/TASKS.md` — active tasks, backlog, completed work
4. `docs/RUNBOOK.md` — operational procedures
5. Scan `docs/DECISIONS/` for ADRs relevant to the current task

If the session involves a specific subsystem, also read:
- QuickBooks integration → `docs/INTEGRATIONS.md` (QBO section)
- AI features → `docs/INTEGRATIONS.md` (AI section)
- Deployment → `docs/DEPLOYMENT.md`
- Supabase schema/functions → `docs/SUPABASE.md`
- Security/RBAC → `docs/SECURITY.md`

## On Session End (Claude instructions)
Before ending a session with meaningful changes:
1. Ensure `docs/TASKS.md` reflects completed and newly discovered work
2. Commit all changes with clear messages (include doc updates in same commit)
3. Push to the working branch

## Yarash Eretz Portfolio Analysis Skill

A strategic analysis framework lives in `.claude/skills/yarash-eretz-analysis/`. Load it when answering questions about:

- Portfolio performance, cash flow, or strategy
- Specific properties (Fremont, Sunderland, Solar B, Solar C, Scenic Drive)
- The Scenic Drive decision (STR vs LTR vs sell)
- Scenario modeling (beach condo, mountain STR, new LTR acquisitions)
- Reconciling QBO actuals against strategic projections
- S&P 500 stacking strategy alongside rental income

**Priority matrix:** God First > Health > Family > Impact. Highest-dollar answer is not automatically the recommended answer.

**Key facts (as of April 2026):**
- 5 properties, all paid off, ~$1.09M value, ~$29.7K/yr current cash flow
- 4 LTRs (Fremont/Sunderland/Solar B/Solar C): solid, $31K/yr combined cash flow
- Scenic Drive (STR): losing ~$1.7K/yr; converts to +$17K/yr as LTR at $3K/mo
- **Active recommendation: Scenario 6** — LTR Convert + S&P Stack, reversible, 24-month checkpoint (due April 2028)

**Rule:** Live QBO data wins for current-state questions. Skill data informs strategy and forecasts.
