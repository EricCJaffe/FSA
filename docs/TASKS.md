# Tasks

_Last updated: 2026-03-12_

---

## In Progress

- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars (manual step — Vercel dashboard)

---

## Phase 1 Backlog

### Foundation (complete)
- [x] Scaffold Next.js 14 + TypeScript + Tailwind
- [x] Connect Supabase project (`zkkxfcxqyojyznjnlrkt`)
- [x] Initial DB schema migration (orgs, user_org_roles, properties, QBO tables, financial_line_items, monthly_reports, ai_insights, audit_log)
- [x] RLS policies + RBAC helper functions
- [x] Supabase SSR client wiring (browser + server + middleware)
- [x] Auth middleware (protect `/dashboard/**`)
- [x] Deploy to Vercel (`fsa-lake.vercel.app`)
- [x] CLAUDE.md + docs structure

### Auth & Users
- [ ] Implement login page (`/login`) with Supabase email auth
- [ ] Add Microsoft OAuth provider in Supabase (Azure AD app registration)
- [ ] Auth callback route (`/auth/callback`)
- [ ] Post-login redirect to `/dashboard`
- [ ] User session display in nav

### Property Registry
- [ ] `/dashboard/properties` — list all properties in org
- [ ] Property detail page `/dashboard/properties/[id]`
- [ ] Add/edit property form (name, address, type LTR/STR, purchase price, market value, mortgage details, QBO class mapping)

### QuickBooks Integration
- [ ] Set up QBO app in Intuit Developer Portal (sandbox + production)
- [ ] Add QBO env vars to Vercel
- [ ] QBO OAuth flow: `/api/qbo/connect` → Intuit → `/api/qbo/callback`
- [ ] Store + refresh QBO tokens in `qbo_connections`
- [ ] QBO sync engine: pull P&L and transactions by class (per property)
- [ ] Store synced data in `financial_line_items`
- [ ] Sync status UI + manual refresh button

### Analytics Dashboards
- [ ] Per-property metrics: NOI, Cap Rate, Cash-on-Cash, DSCR, GRM, OER
- [ ] LTR-specific metrics: occupancy rate, vacancy days, lease expiration tracker
- [ ] STR-specific metrics: ADR, RevPAN, seasonality (requires iTrip data)
- [ ] Month-over-month and YoY trend charts
- [ ] Portfolio-level rollup dashboard

### iTrip STR Data
- [ ] Contact iTrip — determine API availability vs. export format
- [ ] Export 5 years of historical STR data
- [ ] Design import/ingestion flow for iTrip data

### AI Insights Engine
- [ ] Design multi-model routing logic (Claude primary, GPT-4o fallback)
- [ ] Property health summary generation
- [ ] Anomaly detection (point / contextual / structural)
- [ ] Persist insights to `ai_insights` table with model + context
- [ ] Monthly narrative generation

### Monthly Reports
- [ ] Monthly report generation workflow
- [ ] Report viewer UI
- [ ] Commentary/annotation system
- [ ] SendGrid notification on report publish

---

## Phase 2 Backlog

- [ ] Deal Analyzer (new acquisition modeling)
- [ ] STR → LTR conversion scenario modeler
- [ ] Zillow API integration (property values + rent estimates)
- [ ] Jacksonville market intelligence module (CoreLogic/MLS feeds)
- [ ] Plaid integration (optional bank connections)
- [ ] 10-year cash flow projection tool

---

## Phase 3 Backlog

- [ ] Module 2: Lawn & Property Maintenance Business
- [ ] Module 3: Consulting Practice
- [ ] Family Office rollup dashboard (consolidated AUM + balance sheet)
- [ ] Cross-org permission grant workflow

---

## Completed

- [x] 2026-03-12 — Initial scaffold, Supabase + Vercel connected, schema deployed
