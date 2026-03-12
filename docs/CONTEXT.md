# BusinessOS FSA — Context

## What This Is
BusinessOS is a family-office-level financial intelligence platform structured as a **hub with modular spokes** — one module per business unit. This repo (`FSA`) is **Module 1: Property Intelligence Platform**.

## Platform Hierarchy
```
FAMILY OFFICE (Top Level)
├── Full read/write access across all orgs
├── Consolidated balance sheet (ownership-weighted)
├── AUM rollup dashboard
└── Cross-org strategic insights
    ├── ORG: Property Portfolio  ← this module (FSA)
    ├── ORG: Lawn & Property Maintenance Business  (future)
    ├── ORG: Consulting Practice  (future)
    └── ORG: [Partner / Advisor orgs]  (future)
```

## Module 1 Scope
- 4 long-term rental (LTR) properties in Jacksonville, FL
- 1 short-term rental (STR) property
- All financials currently tracked in QuickBooks Online (properties = QBO classes)
- ~5 years of STR historical data available via iTrip

## User Roles (4-Tier RBAC)
| Tier | Role | Access |
|---|---|---|
| 1 | `family_office_admin` | God mode — all orgs, all data |
| 2 | `org_admin` | Full read/write within assigned org(s) |
| 3 | `org_viewer` | Read-only within assigned org(s) |
| 4 | `advisor` | Analytical access (no equity data) within assigned org(s) |

## Entry Points
- `/` — landing page
- `/login` — Supabase auth (Microsoft SSO target)
- `/dashboard` — protected; root of the app
- `/dashboard/properties` — property registry + per-property analytics (Phase 1)
- `/dashboard/portfolio` — portfolio-level rollup (Phase 1)

## Key Infrastructure
| Service | Detail |
|---|---|
| Vercel project | `fsa` (`prj_gIZUuzSvsk5SxdH9cXIfCgkW7ztN`) |
| Supabase project | `FSA` (`zkkxfcxqyojyznjnlrkt`, us-west-2) |
| GitHub repo | `EricCJaffe/FSA` |
| Production URL | `fsa-lake.vercel.app` |

## Phase Summary
- **Phase 1 (active)** — QBO integration, property registry, per-property + portfolio analytics, AI insights engine, Microsoft auth
- **Phase 2** — Deal Analyzer, Market Intelligence (Zillow, CoreLogic, MLS feeds)
- **Phase 3** — Additional business modules (Lawn & Maintenance, Consulting)
- **Future** — Family Office rollup dashboard (consolidated balance sheet, cross-org AUM)
