# Supabase

## Project Details
| Field | Value |
|---|---|
| Project name | FSA |
| Project ID | `zkkxfcxqyojyznjnlrkt` |
| Region | us-west-2 |
| API URL | `https://zkkxfcxqyojyznjnlrkt.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/zkkxfcxqyojyznjnlrkt |

> This Supabase project is **shared** between FSA (property analytics) and businessos-pm (project management). Auth, orgs, tenants, and user roles are unified here.

## Client Files (FSA app)
| File | Use |
|---|---|
| `src/lib/supabase/client.ts` | Browser Client Components |
| `src/lib/supabase/server.ts` | Server Components + Route Handlers |
| `src/lib/supabase/middleware.ts` | Next.js middleware (session refresh) |

## Schema Overview

### Core Tables
| Table | Purpose |
|---|---|
| `tenants` | Top-level grouping entity (Foundation Stone Advisors) |
| `orgs` | Organizations — typed by `org_type`, scoped to a tenant |
| `user_org_roles` | RBAC — user↔org↔role assignments |

### Property Intelligence Tables (FSA)
| Table | Purpose |
|---|---|
| `properties` | Property registry (LTR + STR) |
| `qbo_connections` | QuickBooks OAuth tokens per org |
| `qbo_sync_records` | QBO sync history + status |
| `financial_line_items` | P&L data synced from QBO |
| `monthly_reports` | Generated monthly reports |
| `ai_insights` | Persisted AI-generated insights |
| `audit_log` | All data access + write events |

### Project Management Tables (businessos-pm)
| Table | Purpose |
|---|---|
| `pm_project_templates` | Seeded template definitions (saas-rollout, ministry-discovery, tech-stack-modernization, custom) |
| `pm_projects` | Projects per org |
| `pm_phases` | Phases within a project |
| `pm_tasks` | Tasks within a phase |
| `pm_risks` | Risk register per project |
| `pm_daily_logs` | AI-generated daily standups |
| `pm_files` | Vault file index (Supabase Storage .md files) |

### Enums
- `user_role`: `family_office_admin`, `org_admin`, `org_viewer`, `advisor`
- `org_type`: `property_management`, `field_services`, `consulting`, `client_saas`, `client_tech`, `client_ministry`, `client_engagement`, `family_office`, `custom`
- `property_type`: `ltr`, `str`
- `sync_status`: `pending`, `running`, `success`, `failed`
- `insight_type`: `property_health`, `portfolio_observation`, `anomaly_flag`, `benchmark_comparison`, `hold_sell_recommendation`, `monthly_narrative`
- `anomaly_type`: `point`, `contextual`, `structural`

### RLS Helper Functions
- `is_family_office_admin()` — true if current user has `family_office_admin` role in any org
- `user_has_org_role(org_id, roles[])` — true if current user has any of the given roles in the specified org

## Migrations
All migrations in `supabase/migrations/` named `YYYYMMDDHHMMSS_<slug>.sql`.

| Migration | Description |
|---|---|
| `20260312000000_initial_schema.sql` | Core schema: orgs, properties, RBAC, financial tables, RLS |
| `20260312000001_tenants_org_types_and_pm_schema.sql` | Tenants table, org_type/ownership_pct on orgs, full PM schema + seeded templates |

## Seed Data
| Table | Record |
|---|---|
| `tenants` | `00000000-0000-0000-0000-000000000010` — Foundation Stone Advisors |
| `orgs` | `00000000-0000-0000-0000-000000000001` — Yarash Eretz Property Management (property_management, 100%) |
| `orgs` | `00000000-0000-0000-0000-000000000002` — Honey Lake Digital (client_saas, 0%) |
| `orgs` | `00000000-0000-0000-0000-000000000003` — VakPak (client_tech, 0%) |
| `pm_project_templates` | `saas-rollout`, `ministry-discovery`, `tech-stack-modernization`, `custom` |

## Supabase Storage
Used by the PM module for the markdown vault. Bucket structure:
```
vault/
  [org-slug]/
    [project-slug]/
      PROJECT.md
      /phases/
      /tasks/
      /ai/reports/
      ...
```

## Auth Configuration
- Email auth: enabled (default)
- Microsoft OAuth (Azure AD): **to be configured** — see `docs/INTEGRATIONS.md`
- Auth callback URL: `https://fsa-lake.vercel.app/auth/callback`
- Local callback URL: `http://localhost:3000/auth/callback`

## Edge Functions
None yet. Planned for:
- QBO token refresh (scheduled)
- AI insight generation (FSA)
- Monthly report generation + email dispatch (FSA)
- PM daily standup generation (businessos-pm)
- PM GitHub vault export (businessos-pm, pre-go-live)
