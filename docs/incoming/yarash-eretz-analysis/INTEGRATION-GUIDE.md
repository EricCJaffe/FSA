# Integration Guide — Adding This Analysis to Your Claude Code Project

## What you're adding

A **skill** called `yarash-eretz-analysis` that Claude Code auto-discovers and loads only when a portfolio/property question triggers it. The skill contains:

- Investment thesis and market forecasts
- Structured JSON data (property master, historical P&L, parameters, scenario outcomes)
- Reference markdown (scenarios, Scenic decision, AI stress test, legacy view)
- Reusable prompt templates

It's designed to **complement** your existing QBO-connected project, not replace any of it. QBO stays the source of truth for live data; this skill is the strategic framework.

## Where to put the files

### Option A: Project-level skill (recommended)

Put the entire `yarash-eretz-analysis/` folder inside your project at:

```
your-project-root/
├── CLAUDE.md                          (your existing file — see stanza to add below)
├── .claude/
│   └── skills/
│       └── yarash-eretz-analysis/     ← PUT THE EXPORTED FOLDER HERE
│           ├── SKILL.md
│           ├── data/
│           ├── references/
│           └── scripts/
├── [your existing QBO integration files]
└── ...
```

Claude Code auto-discovers skills in `.claude/skills/` starting with Claude Code v1.x. The `SKILL.md` frontmatter tells Claude when to activate it.

### Option B: User-level skill (if you want it across multiple projects)

Put it at:

```
~/.claude/skills/yarash-eretz-analysis/
```

This makes it available in every Claude Code project you run. Useful if you have separate repos for QBO integration, automation tooling, and analysis.

### Option C: If you're not on a Claude Code version with automatic skill discovery

Treat the folder as reference docs. Add this stanza to your `CLAUDE.md` and reference it explicitly in prompts.

## CLAUDE.md stanza to add

Append this to your existing `CLAUDE.md` (don't replace your existing content):

```markdown
## Yarash Eretz Portfolio Analysis

A strategic analysis framework for the portfolio lives in `.claude/skills/yarash-eretz-analysis/`
(or wherever you placed it). When answering questions about:

- Portfolio performance, cash flow, or strategy
- Specific properties (Fremont, Sunderland, Solar B, Solar C, Scenic Drive)
- The Scenic Drive decision (STR vs LTR vs sell)
- Hypothetical scenarios (beach condo, mountain STR, new LTR acquisitions)
- Reconciling QBO actuals against strategic projections

load the skill and use its data/ and references/ files. The skill is reference material —
live QBO data always wins for current-state questions; the model's forecasts inform strategy.

Priority matrix to respect: God First > Health > Family > Impact.
Highest-dollar answer isn't automatically the recommended answer.

Companion human-readable deliverables (keep these adjacent to the project but not inside it):
- Yarash_Eretz_Analysis_v5.xlsx (full model)
- Yarash_Eretz_Executive_Summary.docx (family office summary)
```

## Quick test after installation

Once files are in place, start a new Claude Code session and try:

```
What's the current state of the Yarash Eretz portfolio?
```

Claude Code should:
1. Discover and load the skill
2. Reference `data/portfolio-master.json` for property data
3. Possibly pull live QBO data to compare
4. Give you a status summary grounded in both

If it doesn't discover the skill automatically, manually prompt:
```
Read .claude/skills/yarash-eretz-analysis/SKILL.md and use it as context for portfolio questions.
```

## What Claude Code will do well with this skill

- **Monthly reconciliations** — pull QBO, compare to baseline, flag variances
- **Scenario re-runs** — "what if Scenic LTR only gets $2,500/mo instead of $3,000?"
- **Decision support** — "should we accelerate the 24-month checkpoint?"
- **Anomaly detection** — "this property's insurance jumped 40% YoY — is that consistent with the model or a problem?"
- **Memo drafting** — "draft a quarterly update memo for Mary Jo using the current QBO data"

## What Claude Code should NOT do with this skill

- **Execute transactions** — this is analysis only; Claude shouldn't initiate QBO changes, property listings, or brokerage actions without explicit user approval on each specific action
- **Overwrite the baseline files** without permission — treat `data/*.json` as versioned reference material
- **Make irreversible recommendations casually** — Scenarios 3, 4, and 5 are irreversible; the skill's guardrails require extra care here
- **Override the mission priority** — even if numbers say otherwise, the priority matrix wins

## Updating the skill over time

As conditions change, update these files:

| File | Update when |
|---|---|
| `data/portfolio-master.json` | Property value changes materially, new property acquired, property sold |
| `data/historical-pl-by-property.json` | Annual refresh with additional year of P&L data |
| `data/model-parameters.json` | Market conditions shift, insurance inflation changes, rent comps update |
| `data/scenario-outcomes.json` | After major parameter updates, re-run projections and refresh |
| `references/*.md` | Thesis changes (e.g., AI job displacement accelerates or stalls) |

Use Claude Code to help — it can ingest new QBO data, re-run the calculations, and produce updated file versions for your review before committing.

## Version notes

- Built: April 2026
- Based on: v5 Excel model, Executive Summary
- Shoreward (realtor/property manager): confirmed as context
- Mary Jo (Eric's wife): confirmed as context
- Priority matrix source: Eric's CODEX_PERSONA.md

## Questions?

If Claude Code does something unexpected with this skill, check:
1. Is the skill in the right location? (`.claude/skills/yarash-eretz-analysis/`)
2. Did the frontmatter in `SKILL.md` parse correctly? (Check YAML syntax)
3. Did the user's prompt actually trigger the skill? (Try being more explicit: "using skill yarash-eretz-analysis, ...")
4. Is there a conflicting skill loaded? (Skills should be additive, not conflicting)

For structural updates, edit `SKILL.md` — the frontmatter `description` controls when the skill activates.
