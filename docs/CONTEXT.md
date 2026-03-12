# BusinessOS FSA — Context

## What This Is
BusinessOS is a family-office-level financial intelligence platform structured as a **hub with modular spokes** — one module per business unit. This repo (`FSA`) is **Module 1: Property Intelligence Platform**.

The platform has two complementary apps sharing one Supabase backend:
- **FSA** (this repo) — Property financial analytics for Yarash Eretz Property Management
- **businessos-pm** (separate repo, planned) — AI-first project management for all orgs

## Tenant + Org Hierarchy
```
TENANT: Foundation Stone Advisors
├── Yarash Eretz Property Management  org_type: property_management  ownership: 100%  ← FSA module
├── Honey Lake Digital                org_type: client_saas          ownership: 0%    ← PM client
├── VakPak                            org_type: client_tech          ownership: 0%    ← PM client
├── [Lawn & Property Maintenance]     org_type: field_services       ownership: TBD   (future)
├── [Consulting Practice]             org_type: consulting           ownership: TBD   (future)
└── [Future orgs...]
```

`ownership_pct = 0` → PM module only, financial analytics hidden
`ownership_pct > 0` → financial analytics + PM modules both available

## Module 1 Scope (FSA — Property Intelligence)
- 4 long-term rental (LTR) properties in Jacksonville, FL
- 1 short-term rental (STR) property
- All financials tracked in QuickBooks Online (properties = QBO classes)
- ~5 years of STR historical data available via iTrip

## User Roles (4-Tier RBAC)
| Tier | Role | Access |
|---|---|---|
| 1 | `family_office_admin` | God mode — all orgs, all data |
| 2 | `org_admin` | Full read/write within assigned org(s) |
| 3 | `org_viewer` | Read-only within assigned org(s) |
| 4 | `advisor` | Analytical access, no equity data (maps to PM-only / 0% ownership orgs) |

## Entry Points (FSA)
- `/` — landing page
- `/login` — Supabase auth (Microsoft SSO target)
- `/dashboard` — protected root
- `/dashboard/properties` — property registry + per-property analytics (Phase 1)
- `/dashboard/portfolio` — portfolio-level rollup (Phase 1)

## Key Infrastructure
| Service | Detail |
|---|---|
| Vercel project | `fsa` (`prj_gIZUuzSvsk5SxdH9cXIfCgkW7ztN`) |
| Supabase project | `FSA` (`zkkxfcxqyojyznjnlrkt`, us-west-2) — shared with businessos-pm |
| GitHub repo | `EricCJaffe/FSA` |
| Production URL | `fsa-lake.vercel.app` |

## Phase Summary (FSA)
- **Phase 1 (active)** — QBO integration, property registry, per-property + portfolio analytics, AI insights, Microsoft auth
- **Phase 2** — Deal Analyzer, Market Intelligence (Zillow, CoreLogic, MLS); PM ↔ financial cross-linking
- **Phase 3** — Additional owned business modules (Lawn & Maintenance, Consulting)
- **Future** — Family Office rollup dashboard (consolidated balance sheet, cross-org AUM)

## Related Docs
- PM module architecture → `docs/PM_MODULE.md`
- Org/tenant decisions → `docs/DECISIONS/0005-org-tenant-structure.md`
- PM architecture decisions → `docs/DECISIONS/0004-pm-module-architecture.md`
