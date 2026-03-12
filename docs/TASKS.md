# Tasks

_Last updated: 2026-03-12_

---

## In Progress

- [ ] Get **P&L by Class** export from QBO (needed for per-property analytics)
- [ ] Build per-property + portfolio analytics dashboards

---

## FSA — Phase 1 Backlog

### Foundation (complete)
- [x] Scaffold Next.js 14 + TypeScript + Tailwind
- [x] Connect Supabase project (`zkkxfcxqyojyznjnlrkt`)
- [x] Initial DB schema (orgs, user_org_roles, properties, QBO tables, financial_line_items, monthly_reports, ai_insights, audit_log)
- [x] RLS policies + RBAC helper functions
- [x] Supabase SSR client wiring (browser + server + middleware)
- [x] Auth middleware (protect `/dashboard/**`)
- [x] Deploy to Vercel
- [x] CLAUDE.md + docs structure + ADRs 0001–0005
- [x] Tenant/org type migration — Foundation Stone Advisors, Yarash Eretz Property Management, Honey Lake Digital, VakPak
- [x] PM schema migration — pm_projects, pm_phases, pm_tasks, pm_risks, pm_daily_logs, pm_files, pm_project_templates (seeded)

### Auth & Users (complete)
- [x] Login page (`/login`) with Supabase email auth
- [x] Auth callback route (`/auth/callback`)
- [x] Post-login redirect to `/dashboard`
- [x] User session display in sidebar
- [x] Vercel env vars configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [x] Light theme + Lucide icons
- [ ] Microsoft OAuth provider in Supabase (Azure AD app registration) — deferred

### Property Registry (complete)
- [x] `/dashboard/properties` — property list for org
- [x] Property detail page `/dashboard/properties/[id]`
- [x] Add/edit property form (name, address, type LTR/STR, purchase details, mortgage, market value, QBO class mapping)
- [x] Seed 5 properties with QBO class names from actual QBO Classes export

### QuickBooks Integration (deferred — plan documented)
- [x] Document QBO integration plan (`docs/QBO_INTEGRATION_PLAN.md`)
- [x] Map QBO Classes → properties (class names stored in DB)
- [x] Import Balance Sheet + P&L data (portfolio-level, 2025)
- [ ] **Get P&L by Class** — per-property income/expense breakdown (manual export from QBO)
- [ ] Build CSV/text import flow for financial data
- [ ] QBO API OAuth flow — deferred until dashboards are solid
- [ ] QBO API sync engine — deferred
- [ ] Sync status UI — deferred

### Analytics Dashboards (next up)
- [ ] Per-property metrics: NOI, Cap Rate, Cash-on-Cash, DSCR, GRM, OER
- [ ] Portfolio-level rollup dashboard (`/dashboard/portfolio`)
- [ ] Month-over-month and YoY trend charts
- [ ] LTR metrics: occupancy rate, vacancy days, lease expiration tracker

### AI Insights Engine (FSA)
- [ ] Multi-model routing logic (Claude primary, GPT-4o fallback)
- [ ] Property health summary generation
- [ ] Anomaly detection (point / contextual / structural)
- [ ] Persist insights to `ai_insights` with model + context snapshot
- [ ] Monthly narrative generation

### Monthly Reports (FSA)
- [ ] Monthly report generation workflow
- [ ] Report viewer UI
- [ ] Commentary/annotation system
- [ ] SendGrid notification on report publish

---

## businessos-pm — Phase 1 Backlog

### Foundation
- [ ] Create `businessos-pm` GitHub repo
- [ ] Scaffold Next.js app + connect same Supabase project
- [ ] Deploy to Vercel as separate project
- [ ] Reuse auth + org/tenant/RBAC from shared Supabase

### Project Management Core
- [ ] Project list view per org
- [ ] Project seed wizard — pick template → AI populates full phase/task structure
- [ ] Phase board view (kanban-style, status badges, progress bars)
- [ ] Task detail view (rich markdown editor, status, owner, due date, dependencies)
- [ ] Risk register view per project
- [ ] Decision log view per project

### Supabase Storage Vault
- [ ] Create Storage bucket: `vault`
- [ ] File write layer: DB write → generate/update `.md` file in Storage
- [ ] File read layer: display markdown content from Storage in app
- [ ] Seed Honey Lake Digital project from `saas-rollout` template
- [ ] Seed VakPak project from `tech-stack-modernization` template

### AI Chat Interface
- [ ] Left panel: Claude API chat (natural language → project updates)
- [ ] Right panel: live project board (Board / Timeline / Risks tabs)
- [ ] NL → DB update pattern (parse AI response → upsert rows)
- [ ] AI responses update `.md` files in Storage alongside DB

### Automation / Reports
- [ ] Weekly status rollup → `WEEKLY-ROLLUP-[date].md`
- [ ] Blocker scan → `BLOCKER-SCAN-[date].md`
- [ ] Decision register compilation
- [ ] Daily standup generation → `/daily/YYYY-MM-DD.md`

### GitHub Export (pre-go-live)
- [ ] Create `businessos-vault` GitHub repo
- [ ] On-demand export: push full vault from Supabase Storage → GitHub
- [ ] Document export workflow in RUNBOOK.md

---

## Phase 2 Backlog (FSA + PM)

- [ ] PM ↔ financial cross-linking (property capital projects → financial_line_items)
- [ ] Client portal for businessos-pm (routing + auth only — schema already supports it)
- [ ] Deal Analyzer (new acquisition modeling)
- [ ] STR → LTR conversion scenario modeler
- [ ] Zillow API integration
- [ ] Jacksonville market intelligence (CoreLogic/MLS)
- [ ] Plaid integration (optional)

## Phase 3 Backlog

- [ ] Module: Lawn & Property Maintenance Business
- [ ] Module: Consulting Practice
- [ ] Family Office rollup dashboard (consolidated AUM + balance sheet)
- [ ] Cross-org permission grant workflow

---

## Completed

- [x] 2026-03-12 — Initial scaffold, Supabase + Vercel connected, schema deployed
- [x] 2026-03-12 — CLAUDE.md + full docs structure
- [x] 2026-03-12 — ADRs 0001–0003 (RBAC/RLS, Next.js App Router, QBO sync strategy)
- [x] 2026-03-12 — ADRs 0004–0005 (PM module architecture, org/tenant structure)
- [x] 2026-03-12 — PM module plan (`docs/PM_MODULE.md`)
- [x] 2026-03-12 — Tenant/org migration: Foundation Stone Advisors, Yarash Eretz, Honey Lake Digital, VakPak
- [x] 2026-03-12 — PM schema: 7 tables + 4 seeded project templates applied to Supabase
- [x] 2026-03-12 — Email auth flow (login, callback, middleware redirect)
- [x] 2026-03-12 — Dashboard shell (sidebar, org card, module cards, phase tracker)
- [x] 2026-03-12 — Vercel deployment working with env vars
- [x] 2026-03-12 — Fix handle_new_user trigger (search_path = public)
- [x] 2026-03-12 — Light theme + Lucide icons (replaced dark mode + emoji)
- [x] 2026-03-12 — Property registry: list, detail, add/edit pages + server actions
- [x] 2026-03-12 — Seed 5 properties from QBO Classes + import Balance Sheet & P&L data
- [x] 2026-03-12 — QBO Integration Plan documented (`docs/QBO_INTEGRATION_PLAN.md`)
