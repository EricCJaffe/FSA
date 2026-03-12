# Security

## Principles
- Financial data is sensitive — treat with the same rigor as regulated data
- Defense in depth: RLS at DB layer + RBAC checks in Server Actions + middleware route protection
- Zero trust: never trust client-sent role or org claims; always verify server-side

## Authentication
- Supabase Auth (email + Microsoft SSO via Azure AD)
- Sessions managed server-side via `@supabase/ssr` and middleware
- All `/dashboard/**` routes protected by middleware (`src/middleware.ts`)

## Authorization (4-Tier RBAC)
| Role | Access |
|---|---|
| `family_office_admin` | All orgs, all data, user management |
| `org_admin` | Full read/write within assigned org(s) |
| `org_viewer` | Read-only within assigned org(s) |
| `advisor` | Read + run reports, no equity data, within assigned org(s) |

RBAC is enforced at **two layers**:
1. **Supabase RLS** — all tables have row-level security enabled with role-checking policies
2. **Server Actions / Route Handlers** — re-verify role before any mutation

## Secrets Management
- All secrets in Vercel environment variables (never in code or `.env.example`)
- `NEXT_PUBLIC_*` vars: only non-secret public config (Supabase URL + anon key)
- Server-only vars: service role key, QBO tokens, AI API keys, SendGrid key
- QBO tokens stored in `qbo_connections` table — target Supabase Vault for encryption at rest
- Never log raw financial values or token values

## Audit Logging
- `audit_log` table captures: user_id, org_id, action, table_name, record_id, old/new data, IP, timestamp
- Target: log all writes to `properties`, `financial_line_items`, `qbo_connections`, `user_org_roles`
- Readable only by `family_office_admin` and `org_admin` (RLS enforced)

## Multi-Tenancy
- Full org data silo — no cross-org data leakage
- All tables include `org_id`; RLS checks org membership on every query
- `is_family_office_admin()` and `user_has_org_role()` are `SECURITY DEFINER` functions (run as DB owner, not caller)

## Transport
- All traffic over HTTPS (enforced by Vercel + Supabase)
- Supabase enforces TLS for all DB connections
