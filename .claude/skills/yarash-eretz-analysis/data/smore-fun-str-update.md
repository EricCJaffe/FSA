# Smore Fun STR Data Integration — March 2026 Update

**Source:** Smore Fun Data Review, March 2026 (uploaded by Eric)
**Date analyzed:** April 20, 2026
**Affects:** Scenic Drive STR revenue assumptions; minor adjustment to decision framework

---

## What This Is

Smore Fun is the STR management company for Scenic Drive (4056 Scenic Dr, Middleburg). They provided 4 years of monthly booking data (2023-2026 YTD through March 22). This file integrates that data into the strategic analysis and flags changes to the baseline.

## How To Use This File in Claude Code

Place this file in `.claude/skills/yarash-eretz-analysis/data/` alongside the other data files. When doing Scenic STR analysis or comparing STR vs LTR conversion, Claude Code should prefer the numbers in this file over the original `historical-pl-by-property.json` because:

1. This is **booking-level data** (most granular, most recent)
2. The original P&L-derived numbers averaged over a startup year that understated steady-state performance
3. This gives monthly seasonality which enables better Q1 YoY comparisons

Both files should remain; this file is the **updated view**, the P&L file remains the **accounting view**.

---

## Annual Summary

| Year | Rental $ | Nights Occ | Occ % (of 365) | Avg ADR | Free Nights |
|------|---------:|-----------:|---------------:|--------:|------------:|
| 2023 | $36,665 | 184 | 50.4% | $236 | 22 |
| 2024 | $32,187 | 194 | 53.2% | $201 | 32 |
| 2025 | $36,866 | 207 | 56.7% | $204 | 26 |
| 2026 YTD (thru 3/22) | $7,544 | 44 | 54.3% | $199 | 9 |
| **3-yr avg (2023-2025)** | **$35,239** | 195 | 53.4% | $214 | 27 |
| **2026 annualized (linear)** | **$33,995** | — | — | — | — |

## Key Findings

### Finding 1: Original model UNDERSTATED STR revenue

- **Original model assumption:** $28,175/yr (based on P&L total $105,657.97 ÷ 3.75 rental years)
- **Reality (3-yr avg 2023-2025):** $35,239/yr
- **Variance:** +$7,064/yr (+25%)
- **Why the gap:** The 3.75-year average included a low-volume ramp-up period in 2021-2022 that dragged down the blended average. Steady-state performance 2023 forward has been materially better.

### Finding 2: Q1 2026 shows significant softening

Year-over-year comparison for comparable periods (Q1 only, since 2026 is partial):

| Period | Q1 Revenue | YoY Change |
|--------|-----------:|-----------:|
| Q1 2023 | $6,990 | — |
| Q1 2024 | $7,730 | +10.6% |
| Q1 2025 | $10,962 | +41.8% |
| Q1 2026 | $7,544 | **-31.2%** |

**Interpretation:** This is a meaningful decline. Two possible explanations:
1. **Early AI-driven discretionary travel pullback** — the stress-test thesis from `references/ai-stress-test.md` playing out
2. **Seasonal noise** — Q1 is typically weakest; one bad February can skew the picture

**April-June data will be the tell.** If Q2 continues the decline trend, the AI stress thesis is validated. If Q2 recovers, Q1 was noise.

### Finding 3: Free nights align with assumed personal use

Free nights (likely personal/family use by Eric and Mary Jo):
- 2023: 22 nights (~3.1 weeks)
- 2024: 32 nights (~4.6 weeks)
- 2025: 26 nights (~3.7 weeks)
- 2026 YTD: 9 nights (already ~1.3 weeks in Q1 alone)

**The model's assumption of "4 personal use weeks/year" is accurate.** No adjustment needed.

### Finding 4: ADR has compressed materially

- 2023 avg ADR: $236
- 2024 avg ADR: $201
- 2025 avg ADR: $204
- 2026 YTD ADR: $199

ADR has dropped ~16% from 2023 to 2026. Occupancy has climbed to offset, so revenue held up. But this suggests **pricing pressure is real** and further declines may not be compensated by occupancy gains.

---

## Impact on Strategic Model

### Scenic STR Economics — UPDATED

Using revised revenue of $35,239/yr and eliminating paid-off interest ($7,419/yr):

| Line Item | Original Model | Updated (Smore Fun) |
|---|---:|---:|
| Revenue | $28,175 | $35,239 |
| Total Expenses (no interest) | $51,438 | $51,438 |
| GAAP Net Income | ($23,263) | ($16,199) |
| Depreciation addback | +$19,876 | +$19,876 |
| Repairs capex adjustment | -$1,644 | -$1,644 |
| **True Cash Flow** | **($5,031)** | **$2,033** |

**Previous version of model showed -$1,742; corrected version shows Scenic STR was actually approximately breakeven to slightly positive in cash terms over 2023-2025.**

### Scenic LTR (Unchanged)

No change to LTR projection. Shoreward's $3,000/mo estimate produces:
- LTR true cash flow: **$15,096/yr** (was $17,068 in v5; minor methodology refinement)

### STR vs LTR Comparison — REVISED

| Scenario | Cash Flow | + Personal Use | Total |
|---|---:|---:|---:|
| STR (current, revised) | $2,033 | $10,000 | **$12,033** |
| LTR (convert) | $15,096 | $0 | **$15,096** |

**The gap between STR and LTR, when including personal use value, narrows to approximately $3,063/yr.** This is a much closer call than the original $18,810/yr gap suggested.

---

## Implications for the Decision Framework

### Does this change the recommendation?

**Short answer: The recommendation holds, but with more nuance.**

**Scenario 6 (LTR Convert + S&P Stack) still wins** on:
- 5-year net worth math (unchanged)
- Simplification of operations (STR work is real even if financially closer to breakeven)
- AI stress test resilience (unchanged — Q1 2026 data reinforces this thesis)
- Optionality preservation

**But Scenario 1 (Status Quo) is more defensible than originally stated.** At $12,033 all-in value, continuing to operate as STR while using it personally 4 weeks/year is *essentially breakeven with LTR conversion when accounting for what the family actually values*. The financial case for conversion is real but not dramatic.

### Where the new data cuts both ways

**Strengthens LTR conversion case:**
- Q1 2026 decline suggests STR market softening ahead
- ADR compression trend suggests future revenue will be lower still
- LTR income of $3K/mo is contractual; STR income is market-exposed

**Weakens LTR conversion case:**
- STR was not actually losing money as modeled — it was roughly breakeven
- Family IS using the property 3-4 weeks/yr — that vacation value is real, not hypothetical
- The $18,810 improvement from LTR shrinks to ~$3,000 when vacation value is counted
- Mary Jo's vote on losing vacation access now carries even more weight

---

## Bottom Line

The Smore Fun data **does not invalidate** the recommendation of Scenario 6 (LTR Convert + S&P Stack), but it **does** reveal:

1. Scenic STR was performing better than my model showed — about breakeven, not a clear loss
2. When you count family vacation value, STR vs LTR is much closer than originally presented
3. Q1 2026 data is a meaningful warning signal that deserves monitoring in Q2

**The decision deserves to be re-examined with Mary Jo** in light of this more accurate picture.

**Action item for the April-June 2026 window:**
1. Get Shoreward's formal written LTR estimate with comps
2. Track Scenic STR performance month-by-month; update this file monthly
3. Make the family decision by end of Q2 2026 with better data in hand
4. Don't default to "keep STR" just because the case narrowed — LTR still wins on simplification and AI-risk mitigation

---

## Files Referenced

- Source: `Smore_Fun_Data_Review_March_2026.xlsx` (user-uploaded)
- Updates: `data/historical-pl-by-property.json`, `data/model-parameters.json`
- Related: `references/scenic-drive-decision.md`, `references/ai-stress-test.md`
