# Supabase

## Project Details
| Field | Value |
|---|---|
| Project name | FSA |
| Project ID | `zkkxfcxqyojyznjnlrkt` |
| Region | us-west-2 |
| API URL | `https://zkkxfcxqyojyznjnlrkt.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/zkkxfcxqyojyznjnlrkt |

## Client Files
| File | Use |
|---|---|
| `src/lib/supabase/client.ts` | Browser Client Components |
| `src/lib/supabase/server.ts` | Server Components + Route Handlers |
| `src/lib/supabase/middleware.ts` | Next.js middleware (session refresh) |

## Schema Overview

### Tables
| Table | Purpose |
|---|---|
| `orgs` | Organizations (Property Portfolio, future modules) |
| `user_org_roles` | RBAC — user↔org↔role assignments |
| `properties` | Property registry (LTR + STR) |
| `qbo_connections` | QuickBooks OAuth tokens per org |
| `qbo_sync_records` | QBO sync history + status |
| `financial_line_items` | P&L data synced from QBO |
| `monthly_reports` | Generated monthly reports |
| `ai_insights` | Persisted AI-generated insights |
| `audit_log` | All data access + write events |

### Enums
- `user_role`: `family_office_admin`, `org_admin`, `org_viewer`, `advisor`
- `property_type`: `ltr`, `str`
- `sync_status`: `pending`, `running`, `success`, `failed`
- `insight_type`: `property_health`, `portfolio_observation`, `anomaly_flag`, `benchmark_comparison`, `hold_sell_recommendation`, `monthly_narrative`
- `anomaly_type`: `point`, `contextual`, `structural`

### RLS Helper Functions
- `is_family_office_admin()` — returns true if current user has `family_office_admin` role in any org
- `user_has_org_role(org_id, roles[])` — returns true if current user has any of the given roles in the specified org

## Migrations
All migrations live in `supabase/migrations/` named `YYYYMMDDHHMMSS_<slug>.sql`.

| Migration | Description |
|---|---|
| `20260312000000_initial_schema.sql` | Full schema: tables, enums, RLS, indexes, seed org |

## Seed Data
- Org `00000000-0000-0000-0000-000000000001` — "Property Portfolio" (slug: `property-portfolio`)

## Auth Configuration
- Email auth: enabled (default)
- Microsoft OAuth (Azure AD): **to be configured** — see `docs/INTEGRATIONS.md`
- Auth callback URL: `https://fsa-lake.vercel.app/auth/callback`
- Local callback URL: `http://localhost:3000/auth/callback`

## Edge Functions
None yet. Will be added for:
- QBO token refresh (scheduled)
- AI insight generation
- Monthly report generation + email dispatch
