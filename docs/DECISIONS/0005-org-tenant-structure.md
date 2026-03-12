# 0005 — Org / Tenant Structure and Org Types

**Date:** 2026-03-12
**Status:** Accepted

## Context
The platform needs to support a mix of owned entities (where financial analytics apply) and client/advisory orgs (where Eric has zero ownership and only manages projects). The initial data model had a flat `orgs` table with no tenant layer and no way to distinguish org type or ownership stake. As the platform grows to include Honey Lake Digital, VakPak, and future client orgs alongside owned properties, the model needs to encode these distinctions.

## Decision

**Tenant layer added above orgs.**
A `tenants` table is introduced as the top-level grouping entity. All orgs belong to a tenant. Foundation Stone Advisors is the tenant for all current and planned orgs.

**`org_type` enum added to orgs.**
Org type controls which modules are available in the UI and which project templates are pre-loaded:
| Type | Modules available |
|---|---|
| `property_management` | Financial analytics + PM |
| `field_services` | PM + basic financials |
| `consulting` | PM + financials |
| `client_saas` | PM only |
| `client_tech` | PM only |
| `client_ministry` | PM only |
| `client_engagement` | PM only (generic client type) |
| `family_office` | All modules + consolidated rollup |
| `custom` | Configured per org |

**`ownership_pct` added to orgs.**
Encodes Eric's ownership stake (0.0000–1.0000). `0` = advisory/PM only, equity and financial analytics hidden. `>0` = owned, financial module visible. This pairs naturally with the existing `advisor` RBAC role, which already hides equity data.

**`parent_org_id` added for future hierarchy.**
Allows sub-orgs (e.g., a property LLC under the main property management org). Not used in Phase 1 but available without a migration later.

**Named orgs at launch:**
| Org | Type | Ownership | Notes |
|---|---|---|---|
| Yarash Eretz Property Management | `property_management` | 100% | Jacksonville portfolio — replaces seed "Property Portfolio" |
| Honey Lake Digital | `client_saas` | 0% | SaaS product rollout PM client |
| VakPak | `client_tech` | 0% | Tech stack modernization PM client |

## Consequences
- **Easier:** Adding a new client org is one row insert — no schema changes.
- **Easier:** `ownership_pct = 0` cleanly gates financial data without custom permission logic — maps directly to existing RLS policies.
- **Easier:** Tenant layer makes the future consolidated family-office rollup dashboard trivial to query (all orgs WHERE tenant_id = X).
- **Harder:** `org_type` as an enum means adding new types requires a migration. Considered `text` instead but rejected — enum enforces valid values and is worth the occasional migration cost.
- **Tradeoff:** `parent_org_id` adds a self-referential FK; kept nullable and unused in Phase 1 to avoid complexity while preserving the option.
