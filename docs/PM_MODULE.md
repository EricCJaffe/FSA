# BusinessOS — Project Management Module

## Overview
A standalone Next.js app (`businessos-pm`) sharing the same Supabase backend as FSA. AI-first project management using markdown files as the canonical source of truth, with Supabase as the queryable index.

**Repo:** `businessos-pm` (to be created)
**Philosophy:** *"Files as memory, AI as intelligence, UI as a window."*

---

## Architecture

### Dual-Layer Storage
Every project object lives in two places simultaneously:
1. **Supabase DB** — structured columns (status, owner, due_date, etc.) for fast queries, dashboards, and AI reasoning
2. **Supabase Storage** — `.md` files with YAML frontmatter at `vault/[org-slug]/[project-slug]/...` for portability, Obsidian compatibility, and backup

Writes go to DB first, then generate/update the `.md` file. Reads use DB for structured queries, Storage files for full content display and export.

### Vault Folder Structure (per project)
```
vault/[org-slug]/[project-slug]/
  PROJECT.md              ← charter, goals, owner, dates, budget
  RISKS.md                ← risk register
  DECISIONS.md            ← decision log
  STATUS.md               ← AI-generated program status
  /phases/
    p01-[phase-name].md
    p02-[phase-name].md
  /tasks/
    t-[task-slug].md
  /people/
    [person-name].md
  /daily/
    YYYY-MM-DD.md         ← AI-generated standup
  /ai/
    prompts.md
    /reports/
      WEEKLY-ROLLUP-YYYY-MM-DD.md
      BLOCKER-SCAN-YYYY-MM-DD.md
```

### GitHub Export (pre-go-live)
A scheduled or on-demand export pushes the full vault to a `businessos-vault` GitHub repo. Not a live sync — Supabase Storage is always authoritative. Provides: offline Obsidian access, version history, and a backup independent of Supabase.

---

## Frontmatter Standards

### PROJECT.md
```yaml
---
name: "Project Name"
description: "One line description"
org: "yarash-eretz"
owner: "[[eric-jaffe]]"
template: "saas-rollout"   # saas-rollout | ministry-discovery | tech-stack-modernization | custom
start: 2026-03-12
target: 2026-07-31
budget: 50000
status: active             # active | complete | paused | archived | on-hold
phases: [p01, p02, p03]
---
```

### Task file (tasks/t-[slug].md)
```yaml
---
id: t-task-slug
project: "[[project-slug]]"
phase: "[[p01-phase-name]]"
owner: "[[person-name]]"
status: not-started        # not-started | in-progress | complete | blocked | pending | on-hold
due: 2026-04-18
depends-on: ["[[t-other-task]]"]
risk: "[[r-risk-name]]"
---
## Notes
Freeform context, decisions, blockers.
## Subtasks
- [ ] Subtask one
- [ ] Subtask two
```

### Standardized Status Values
| Value | Meaning |
|---|---|
| `not-started` | No work begun |
| `in-progress` | Active work happening |
| `complete` | Done, no further action needed |
| `blocked` | Cannot proceed — needs external action |
| `pending` | Waiting on a named dependency |
| `on-hold` | Paused by decision, not blocked |

---

## Project Templates

Templates are DB-seeded rows in `pm_project_templates`. New templates require no code change.

### Template A — SaaS App Rollout
**Slug:** `saas-rollout` | **Seed project:** Honey Lake Digital
26 phases grouped into 4 stages:
| Group | Phases |
|---|---|
| BUILD | 01 Idea → 07 Testing |
| GO-TO-MARKET | 08 Launch → 11 Conversion |
| GROW | 12 Revenue → 16 Scaling |
| FOUNDATION | 17 Legal → 26 Vendor & Staffing |

### Template B — Ministry / Org Discovery
**Slug:** `ministry-discovery` | **Seed project:** MinistryOS client TBD
7 phases (0 Prayer & Commitment → 6 Equip Empower Release) + MinistryOS Components section.
Department Discovery (Phase 3) clones a 7-layer template per department.
Framework: Prayer + Vision + People + Data + Process + Meetings + Issues.

### Template C — Tech Stack Modernization (PMBOK)
**Slug:** `tech-stack-modernization` | **Seed project:** VakPak
12 PMBOK management sections + N parallel project workstreams (configurable at seed time).
Includes: Risk register (R01–R0N), cost management, procurement, stakeholder management.

### Template D — Custom
**Slug:** `custom`
Blank slate. User defines phases, tasks, and structure through AI chat or manual entry.

---

## Structured Markdown Files (Per Subfolder)

Every leaf subfolder in every project contains three standard files:

**STATUS.md**
```markdown
# Status: [Workstream Name]
## Current State
- **Status:** [not-started | in-progress | complete | blocked]
- **Owner:** [Name]
- **Last Updated:** [YYYY-MM-DD]
- **Progress:** [0-100]%
## What's Done
## What's Next
- [ ] [action] — Due: [date]
## Blockers
## Notes
```

**DECISIONS.md**
```markdown
# Decisions: [Workstream Name]
### [YYYY-MM-DD] — [Decision Title]
- **Decision:**
- **Rationale:**
- **Decided by:**
- **Impact:**
- **Alternatives considered:**
```

**RESOURCES.md**
```markdown
# Resources: [Workstream Name]
## Tools & Platforms
## Reference Material
## Vendor Info
## Key Contacts
```

---

## AI Layer

| Capability | How |
|---|---|
| Project generation | Describe project in chat → Claude generates full folder + file structure |
| Natural language updates | "Set X due date to April 15" → AI writes updated frontmatter to DB + file |
| Weekly rollup | Queries all STATUS.md content → generates `WEEKLY-ROLLUP-YYYY-MM-DD.md` |
| Blocker scan | Scans all tasks WHERE status = 'blocked' → consolidated report |
| Daily standup | AI writes `/daily/YYYY-MM-DD.md` from task delta since yesterday |
| Decision register | Compiles all DECISIONS.md content → chronological master log |
| Risk radar | Scans risk register, flags escalating items |
| Cross-project report | Hub view across all active projects for the tenant |

AI model routing:
- Claude (primary) — complex analysis, project generation, weekly narrative
- Lighter model — routine queries (status lookups, field updates, blocker counts)

All AI outputs persisted to Storage (`/ai/reports/`) and indexed in `pm_files`.

---

## Automation Commands → Server Actions

| Command | Server Action | Output |
|---|---|---|
| `seed-project` | `/api/pm/projects/seed` | Full vault structure + DB rows from template |
| `status-rollup` | `/api/pm/reports/rollup` | `WEEKLY-ROLLUP-[date].md` |
| `blocker-scan` | `/api/pm/reports/blockers` | `BLOCKER-SCAN-[date].md` |
| `regen-map` | Real-time (DB query) | Live dashboard, no file needed |
| `hub-report` | `/api/pm/reports/hub` | `HUB-REPORT-[date].md` |
| `decision-register` | `/api/pm/reports/decisions` | `DECISION-REGISTER-[date].md` |
| `add-department` | `/api/pm/phases/clone` | New phase folder + 7 layer subfolders |
| `github-export` | `/api/pm/export/github` | Push vault to `businessos-vault` repo |

---

## UI Design Language

- **Theme:** Dark mode — bg: `#0f172a`, card: `#1e293b`, text: `#e2e8f0`
- **Status colors:** Complete `#10b981`, In Progress `#f59e0b`, Not Started `#475569`, Blocked `#ef4444`, On Hold `#6366f1`
- **Layout:** Left panel = AI chat, Right panel = live project board (Board / Timeline / Risks tabs)
- **Components:** Stats bar, phase/workstream cards with progress bars, status badges
- Template A: phase group headers (Build / GTM / Grow / Foundation)
- Template B: department discovery grid, MinistryOS component wheel
- Template C: milestone timeline, budget overview, risk register, PMBOK governance grid

---

## Governance Cadence

| Template | Weekly | Bi-weekly | Monthly | Quarterly |
|---|---|---|---|---|
| A (SaaS) | AI status rollup | Sprint review | Budget vs actuals | Phase assessment |
| B (Ministry) | Champion check-in | — | Senior leadership review | Roadmap adjustment |
| C (PMBOK) | Cross-project sync | Integrated program report | Technical integration review | — |

---

## Client Portal (Phase 2)

Schema is already designed for this — no migration needed. Phase 2 work is UI only:
- Client user gets `org_viewer` role in their org via `user_org_roles`
- Client sees: their project dashboards, phase status, risks, decisions, weekly rollups
- Client cannot see: other orgs, financial data, internal notes flagged private
- Routing: `/portal/[org-slug]/projects`

---

## Phase 1 Build Sequence

1. Create `businessos-pm` GitHub repo + scaffold Next.js app
2. Connect same Supabase project; reuse auth + org/tenant schema
3. Apply PM schema migration (pm_project_templates, pm_projects, pm_phases, pm_tasks, pm_risks, pm_daily_logs, pm_files)
4. Seed 3 project templates (A/B/C) with full phase/task structures
5. Seed Honey Lake Digital and VakPak as orgs + their projects
6. Build project list + project detail views
7. Build AI chat interface (Claude API) with NL → project update pattern
8. Build weekly rollup + blocker scan report generation
9. Build Supabase Storage vault read/write layer
10. Build GitHub export (pre-go-live)
11. Deploy to Vercel as `businessos-pm`

---

## File Naming Conventions

- Phase folders: `pNN-[phase-name]` (zero-padded, kebab-case)
- Task files: `t-[task-slug].md`
- Reports: `[TYPE]-YYYY-MM-DD.md` (e.g., `WEEKLY-ROLLUP-2026-03-12.md`)
- Markdown files: `ALL-CAPS.md` for standard docs (STATUS, DECISIONS, RESOURCES)
- People files: `[firstname-lastname].md`
