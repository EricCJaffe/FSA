# BusinessOS PM — New Project Kickoff Guide

_Generated: 2026-03-13_

This document is a standalone starting point for spinning up the `businessos-pm` repo. Hand this to Claude in a fresh session to bootstrap the project.

---

## What You're Building

An AI-first project management app (`businessos-pm`) that shares the same Supabase backend as the FSA property intelligence app. Separate GitHub repo, separate Vercel project, same database.

**Philosophy:** _"Files as memory, AI as intelligence, UI as a window."_

---

## Infrastructure Setup

### 1. GitHub Repository

Create: `EricCJaffe/businessos-pm`

### 2. Vercel Project

Create a **new** Vercel project (`businessos-pm`) linked to the new GitHub repo. Do NOT reuse the FSA Vercel project.

### 3. Supabase (Shared)

Reuse the existing Supabase project:
- **Project:** `FSA` (ref: `zkkxfcxqyojyznjnlrkt`, region: `us-west-2`)
- **Auth:** Already configured — email auth works, Microsoft OAuth planned
- **Schema:** PM tables already exist (migrated via FSA)

The PM app connects to the same Supabase URL and anon key as FSA. Auth, orgs, user roles, and RLS all carry over automatically.

### 4. Environment Variables (Vercel)

Set these on the new Vercel project:

| Variable | Source | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as FSA | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as FSA | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as FSA | **No** |
| `OPENAI_API_KEY` | For AI chat/reports | **No** |
| `ANTHROPIC_API_KEY` | For Claude AI features | **No** |

---

## Tech Stack

Match FSA exactly for consistency:

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase** (`@supabase/ssr` for server/client session management)
- **Lucide** icons
- **Recharts** (if dashboards/charts needed)
- Deploy to **Vercel** (auto-deploy on push to `main`)

---

## Existing Database Schema (Already Migrated)

These tables already exist in Supabase — do NOT re-create them:

### Shared tables (used by both FSA and PM)
- `orgs` — tenant/org hierarchy (Foundation Stone Advisors umbrella)
- `user_org_roles` — RBAC (family_office_admin, org_admin, org_viewer, advisor)

### PM-specific tables
- `pm_project_templates` — seeded with 4 templates (saas-rollout, ministry-discovery, tech-stack-modernization, custom)
- `pm_projects` — projects linked to orgs
- `pm_phases` — phases within projects
- `pm_tasks` — tasks within phases
- `pm_risks` — risk register per project
- `pm_daily_logs` — daily standup entries
- `pm_files` — file index for Supabase Storage vault

### RLS
RLS is enabled on all tables. Existing policies enforce org-level isolation via `user_org_roles`. The PM app inherits this automatically.

---

## Tenant / Org Context

```
TENANT: Foundation Stone Advisors
├── Yarash Eretz Property Management  → FSA module (property analytics)
├── Honey Lake Digital                → PM client (saas-rollout template)
├── VakPak                            → PM client (tech-stack-modernization template)
└── [Future orgs...]
```

- Orgs with `ownership_pct = 0` are PM-only clients (no financial data access)
- Orgs with `ownership_pct > 0` get both FSA and PM modules

---

## User Roles (4-Tier RBAC)

| Tier | Role | PM Access |
|---|---|---|
| 1 | `family_office_admin` | All orgs, all projects, all data |
| 2 | `org_admin` | Full read/write within assigned org's projects |
| 3 | `org_viewer` | Read-only project views (client portal in Phase 2) |
| 4 | `advisor` | Read-only analytical access |

---

## Project Structure (Scaffold This)

```
businessos-pm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, callback routes
│   │   ├── (dashboard)/        # Protected app routes
│   │   │   ├── projects/       # Project list
│   │   │   ├── projects/[id]/  # Project detail (phases, tasks, risks)
│   │   │   └── chat/           # AI chat interface
│   │   └── api/                # Route handlers
│   │       └── pm/             # PM-specific APIs
│   ├── components/             # React components
│   │   ├── ui/                 # Shared UI primitives
│   │   ├── layout/             # Shell, sidebar, nav
│   │   ├── project/            # Project-specific components
│   │   └── chat/               # AI chat components
│   ├── lib/
│   │   ├── supabase/           # client.ts, server.ts, middleware.ts
│   │   └── ai/                 # AI chat + report generation
│   ├── hooks/
│   └── types/
├── supabase/
│   └── migrations/             # Only NEW migrations (PM tables already exist)
├── docs/
│   ├── CONTEXT.md
│   ├── TASKS.md
│   └── DECISIONS/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Supabase Client Wiring

Copy the same pattern from FSA:

**Server client** (`src/lib/supabase/server.ts`):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
```

**Browser client** (`src/lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Middleware** (`src/middleware.ts`):
- Protect `/dashboard/**` routes
- Refresh Supabase auth session on each request

---

## Auth Flow

Reuse the same auth flow as FSA — users log in once and their session works across both apps (same Supabase project = same auth).

- `/login` — email + password (Microsoft OAuth planned)
- `/auth/callback` — Supabase auth callback
- Post-login redirect → `/dashboard/projects`

---

## UI Design

- **Theme:** Dark mode — bg: `#0f172a`, card: `#1e293b`, text: `#e2e8f0`
- **Status colors:** Complete `#10b981`, In Progress `#f59e0b`, Not Started `#475569`, Blocked `#ef4444`, On Hold `#6366f1`
- **Layout:** Left panel = AI chat, Right panel = live project board

This is different from FSA's light theme — the PM module uses a dark theme for visual distinction.

---

## Phase 1 Build Sequence

1. **Scaffold** — `npx create-next-app@latest businessos-pm` with TypeScript + Tailwind + App Router
2. **Wire Supabase** — server.ts, client.ts, middleware.ts (copy from FSA)
3. **Auth pages** — /login, /auth/callback (copy from FSA, adjust redirect)
4. **Dashboard shell** — dark theme sidebar, org switcher, nav links
5. **Project list** — `/dashboard/projects` — query `pm_projects` joined with `orgs`
6. **Project detail** — `/dashboard/projects/[id]` — phases, tasks, risks views
7. **Project seed wizard** — pick template → AI generates full project structure
8. **AI chat interface** — left panel chat, right panel live board
9. **Supabase Storage vault** — read/write `.md` files alongside DB
10. **Report generation** — weekly rollup, blocker scan, daily standup
11. **Deploy to Vercel** — connect repo, set env vars, auto-deploy on push

---

## Project Templates (Already Seeded in DB)

| Template | Slug | Seed Project |
|---|---|---|
| SaaS App Rollout | `saas-rollout` | Honey Lake Digital |
| Ministry / Org Discovery | `ministry-discovery` | TBD |
| Tech Stack Modernization | `tech-stack-modernization` | VakPak |
| Custom | `custom` | Blank slate |

See `docs/PM_MODULE.md` in the FSA repo for full template details, vault folder structure, frontmatter standards, and AI layer specs.

---

## CLAUDE.md for the New Repo

When you scaffold the repo, create a `CLAUDE.md` with:

- Build commands: `npm run dev`, `npm run build`, `npm run lint`
- Tech stack (same as above)
- Project structure
- Code conventions (match FSA: server components by default, server actions for mutations, no secrets in NEXT_PUBLIC_*)
- Security rules (RBAC at DB + server action layer, RLS on all tables)
- Link back to FSA docs for shared schema reference

---

## Key Differences from FSA

| Aspect | FSA | businessos-pm |
|---|---|---|
| Theme | Light | Dark |
| Primary data | Financial (QBO sync) | Projects/tasks/risks |
| Storage | DB only | DB + Supabase Storage (.md files) |
| AI role | Insights/analysis | Chat interface + project generation |
| GitHub repo | `EricCJaffe/FSA` | `EricCJaffe/businessos-pm` |
| Vercel project | `fsa` | `businessos-pm` |
| Supabase | Shared | Shared |

---

## Reference Documents (in FSA Repo)

These docs in `EricCJaffe/FSA` have detailed specs you'll need:

- `docs/PM_MODULE.md` — Full architecture, vault structure, frontmatter standards, AI layer, templates
- `docs/CONTEXT.md` — Tenant/org hierarchy, role model
- `docs/DECISIONS/0004-pm-module-architecture.md` — ADR for PM architecture decisions
- `docs/DECISIONS/0005-org-tenant-structure.md` — ADR for multi-org/tenant model
- `docs/ENVIRONMENT.md` — Environment variables reference
- `docs/SUPABASE.md` — Shared database schema details
