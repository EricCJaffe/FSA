---
name: yarash-eretz-analysis
description: Use this skill when analyzing the Yarash Eretz Property Management real estate portfolio, reconciling QuickBooks data against the strategic model, answering questions about portfolio performance, cash flow, scenarios, or making property decisions (Scenic Drive disposition, beach/mountain acquisitions, LTR vs STR). Triggers on any mention of Yarash Eretz, the properties (Fremont, Sunderland, Solar B, Solar C, Scenic Drive), "the portfolio", portfolio-level P&L analysis, Shoreward (realtor/property manager), Mary Jo in a portfolio context, or strategic scenarios. Do NOT use for unrelated QBO tasks (payroll, invoicing, non-portfolio bookkeeping).
---

# Yarash Eretz Portfolio Analysis

## What this skill is

A reference framework built April 2026 for the Jaffe family (Eric + Mary Jo) real estate portfolio. Contains the investment thesis, property master data, 5-year projections across 6 strategic scenarios, AI economic stress test, and mission-weighted decision framework.

**This is reference material, not a directive.** When the QBO-connected project needs strategic context to reconcile, analyze, or answer portfolio questions, this skill provides the analytical backbone. Use it alongside live QBO data — the model's assumptions should be validated against actuals, not override them.

## When to use this skill

**YES — load this skill when:**
- User asks a question about portfolio performance, cash flow, or scenario analysis
- User references a specific property by name (Fremont, Sunderland, Solar B, Solar C, Scenic)
- User asks "should we sell/keep/convert..." questions
- User wants to compare live QBO actuals against the strategic model
- User references Shoreward, Mary Jo in a portfolio context, or mentions the "family office" framing
- User asks about the Scenic Drive decision (STR vs LTR vs sell)
- User wants to model a new scenario (beach condo, mountain STR, different LTR rates)

**NO — do not use this skill when:**
- User is doing routine QBO bookkeeping unrelated to strategy (invoice entry, reconciliation-only tasks)
- User is asking about Eric's consulting work, ministry, or anything non-portfolio
- User is asking a general real estate question not tied to their specific properties

## How to use this skill

### Step 1: Load the portfolio master data

The file `data/portfolio-master.json` contains canonical property data — basis, current value, purchase dates, appreciation, all in structured form. Load this first so subsequent analysis grounds in real numbers.

```bash
cat skills/yarash-eretz-analysis/data/portfolio-master.json
```

### Step 2: Cross-reference against live QBO data

Where possible, reconcile the model's historical P&L assumptions (in `data/historical-pl-by-property.json`) against actual QBO data. The model uses P&L data through 2025 — any 2026 YTD data from QBO is more current and should be preferred.

**Known reconciliation points:**
- `Due From Shoreward` on the Balance Sheet = accrued 2026 LTR rents not yet distributed (~$18.5K as of April 2026). This is a timing/distribution issue, not a revenue issue.
- Everything else on the BS/P&L is pinned to 2025 year-end.
- If QBO shows material variance from the model's per-property annual P&L (`historical-pl-by-property.json`), flag it and note which is more current.

### Step 3: Apply the analytical framework

For strategic questions, reference the appropriate document:

- `references/thesis.md` — Why the portfolio is structured this way; AI resilience argument; market forecasts by geography
- `references/scenarios.md` — The 6 scenarios with full 5-year, 10-year, and 20-year projections
- `references/scenic-drive-decision.md` — Deep dive on the STR→LTR conversion analysis
- `references/decision-framework.md` — Mission-weighted scoring methodology and current recommendation
- `references/ai-stress-test.md` — How each scenario performs in an AI-driven recession

Cite the specific document when drawing on its reasoning, so the user can verify.

### Step 4: When calculating, use the parameters file

`data/model-parameters.json` contains all the assumptions (growth rates, expense inflation, tax rates, etc.) the original model used. If the user wants to test a different assumption, modify in memory for the current answer — don't overwrite the file without explicit permission.

### Step 5: Respect the mission hierarchy

Eric's priority matrix: **God First > Health > Family > Impact**. When presenting trade-offs, surface the mission-alignment dimension, not just the dollar outcome. The highest-NPV scenario isn't automatically the recommended one.

## Integration with the QBO project

This skill is designed to complement (not replace) the QBO-connected analysis the user already has. Typical flow:

1. **QBO project** — provides live, current financial data (actuals)
2. **This skill** — provides strategic framework, forecasts, scenario analysis (model)
3. **User + Claude Code together** — reconcile actuals against model; update assumptions when reality diverges; re-run scenarios with fresh data

When the QBO data and this skill's assumptions disagree, **the QBO data wins** for current-state questions. The model's assumptions should be updated to reflect observed reality.

## Key numbers to remember (as of April 2026)

- Portfolio: 5 properties, all paid off, ~$1.09M value, ~$29.7K/yr cash flow
- 4 LTRs (Fremont/Sunderland/Solar B/Solar C): collectively $31K/yr cash flow, 5.3% cash-on-cash, solid
- Scenic Drive (STR): losing ~$1.7K/yr; cash-positive ~$17K/yr if converted to LTR at $3K/mo
- Active recommendation: Scenario 6 (LTR Convert + S&P Stack), reversible, 24-month checkpoint

## Files in this skill

```
yarash-eretz-analysis/
├── SKILL.md                                    (this file — auto-discovered by Claude Code)
├── data/
│   ├── portfolio-master.json                   (property master: basis, value, dates)
│   ├── historical-pl-by-property.json          (P&L line items per property, annualized)
│   ├── model-parameters.json                   (growth rates, inflation, tax assumptions)
│   └── scenario-outcomes.json                  (5Y, 10Y, 20Y projections per scenario)
├── references/
│   ├── thesis.md                               (why this portfolio, AI resilience, market forecasts)
│   ├── scenarios.md                            (6 scenarios detailed)
│   ├── scenic-drive-decision.md                (Scenic STR→LTR deep dive)
│   ├── decision-framework.md                   (mission-weighted scoring + recommendation)
│   ├── ai-stress-test.md                       (recession scenarios)
│   └── legacy-framework.md                     (10-20 year generational view)
└── scripts/
    ├── reconcile-qbo-vs-model.md               (prompt template for QBO/model reconciliation)
    └── re-run-scenarios.md                     (prompt template for "what if" analyses)
```

## One-time setup note

If you're integrating this into a new project, the companion Excel workbook (`Yarash_Eretz_Analysis_v5.xlsx`) and Executive Summary (`Yarash_Eretz_Executive_Summary.docx`) should live alongside the project repo, not inside this skill — they're the human-readable deliverables; this skill is the machine-readable version for Claude Code to work with.
