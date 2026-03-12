# 0004 — Project Management Module Architecture

**Date:** 2026-03-12
**Status:** Accepted

## Context
BusinessOS needs a project management capability to support Eric's consulting work (managing projects for client orgs like Honey Lake Digital and VakPak) and internal operational projects. Two prior brainstorming sessions produced complementary designs: one focused on philosophy and data model (files as truth, AI as intelligence, Obsidian-inspired), the other on concrete templates, automation commands, and visual design. The question was how to merge these and where to build it.

## Decision

**1. Separate app, shared Supabase backend.**
The PM module is built as its own Next.js/Vercel app (`businessos-pm`), not inside FSA. It shares the same Supabase project, so auth, orgs, users, and tenant structure are unified. Cross-linking to financial data is deferred to Phase 2; the schema is designed to support it via `org_id` foreign keys.

**2. Custom Obsidian-style architecture — not Obsidian itself.**
Files (`.md`) are the canonical source of truth, stored in Supabase Storage in a structured vault hierarchy. Supabase DB is the queryable index (structured frontmatter fields parsed into columns). The in-app editor reads/writes both. No dependency on Obsidian the app, but files are Obsidian-compatible — they can be opened in Obsidian directly or exported to a local vault.

Storage path structure:
```
/vault/[org-slug]/[project-slug]/
  PROJECT.md
  RISKS.md
  DECISIONS.md
  STATUS.md
  /phases/p1-phase-name.md
  /tasks/t-task-slug.md
  /people/person-name.md
  /daily/YYYY-MM-DD.md
  /ai/reports/
```

**3. Supabase Storage primary; GitHub export added late in Phase 1 before go-live.**
All files live in Supabase Storage. A GitHub export/sync step is added to the build plan before go-live so files exist in two places — providing portability (Obsidian local vault compatibility) and a backup. This is not a live sync; it is a scheduled or on-demand export.

**4. Phase 1: Eric-only. Schema designed for client portal (Phase 2).**
Phase 1 is internal — only Eric uses the PM app. However, the `user_org_roles` RBAC model already supports client portal access: client team members would receive `org_viewer` or `advisor` role scoped to their org. No additional schema changes are needed for Phase 2 client portal — only UI and routing work.

**5. Three seed templates + flexible custom type.**
| Slug | Based on | Seed project |
|---|---|---|
| `saas-rollout` | 26-phase SaaS rollout | Honey Lake Digital |
| `ministry-discovery` | 7-phase org discovery | MinistryOS client TBD |
| `tech-stack-modernization` | PMBOK 12 sections + workstreams | VakPak |
| `custom` | Blank — user defines all phases | — |
Templates are DB-seeded rows, not hardcoded. New templates can be added without code changes.

**6. AI chat interface as primary interaction.**
Left panel = Claude chat (natural language → project updates). Right panel = live project dashboard. AI generates weekly rollups, blocker scans, and daily standups from DB queries + file content.

## Consequences
- **Easier:** PM is cleanly independent — it can be worked on, deployed, and iterated without touching FSA financial data.
- **Easier:** Client portal is a routing + auth UI problem only — the data model already supports it.
- **Easier:** Supabase Storage files are portable; user is never locked into this app to read their project data.
- **Easier:** Templates as DB rows means adding a Type D (property capital project) or any future type requires no code change.
- **Harder:** Two apps to maintain (FSA + PM), though they share auth/infra.
- **Harder:** Supabase Storage + DB dual-write requires a reliable sync pattern — file and DB row must stay consistent. A sync failure could create drift between them.
- **Tradeoff:** GitHub export is not real-time. Files in Storage are always current; GitHub is a periodic snapshot for portability/backup. Acceptable for Phase 1 use case.
