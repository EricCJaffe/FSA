# 0001 — Multi-Tenant RBAC with Supabase RLS

**Date:** 2026-03-12
**Status:** Accepted

## Context
BusinessOS is designed from the start as a multi-org platform — a family office hub with multiple business unit modules. Even in Phase 1 (single property portfolio org), the data model must support future orgs (lawn business, consulting practice, partner orgs with partial ownership, advisor-only orgs with zero ownership). Some users will span orgs with different roles in each; some data (equity %) must be hidden from certain roles even within the same org.

The platform also needs to support a future consolidated family-office view across all orgs, which requires a clean org-level isolation model that can be selectively opened up.

## Decision
Adopt a **4-tier RBAC model** enforced at two layers:

**Roles (org-scoped):**
| Tier | Role | Notes |
|---|---|---|
| 1 | `family_office_admin` | Cross-org god mode |
| 2 | `org_admin` | Full read/write within org |
| 3 | `org_viewer` | Read-only within org |
| 4 | `advisor` | Read + run reports, no equity data |

**Enforcement layers:**
1. **Supabase RLS** on every table — policies use `auth.uid()` and helper functions (`is_family_office_admin()`, `user_has_org_role()`) to gate row access. No query can bypass this at the DB level.
2. **Server Actions / Route Handlers** — re-verify role before any mutation. Never trust client-sent role or org claims.

**Data model:** Every financial table includes `org_id`. Users are linked to orgs via `user_org_roles` (junction table). There is no cross-org data access except via `family_office_admin`.

## Consequences
- **Easier:** Adding new orgs is additive — no schema changes, just new rows in `orgs` and `user_org_roles`. Future modules reuse the same auth/RBAC pattern.
- **Easier:** Supabase RLS means the DB itself is the security boundary — a bug in application code cannot leak cross-org data.
- **Easier:** The `advisor` role cleanly maps to the use case of Eric advising client orgs with zero ownership visibility.
- **Harder:** Every query must include `org_id` filtering (enforced by RLS, but must be designed in from the start). Forgetting `org_id` on a new table means RLS has no basis to filter on.
- **Harder:** The `family_office_admin` cross-org view (future consolidated dashboard) requires careful query design to aggregate across orgs without leaking org-level detail to lower-tier users.
- **Tradeoff:** Dual enforcement (RLS + Server Actions) adds a small amount of redundancy, but is the right call for financial data — defense in depth over convenience.
