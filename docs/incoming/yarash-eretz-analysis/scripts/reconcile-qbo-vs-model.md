# Prompt Template: Reconcile QBO Data Against the Model

## When to use this

When current QBO data is available and you want to compare actual performance against the strategic model's assumptions. Run this monthly (for quick check) or quarterly (for full review).

## Suggested prompts

### Quick monthly reconciliation
```
Pull the latest P&L by Class from QuickBooks for YTD 2026.
Compare each property's actual performance against the historical baseline in
skills/yarash-eretz-analysis/data/historical-pl-by-property.json.

For any line item with variance > 15% from the annualized baseline, flag it and suggest whether
it looks like a timing issue (will normalize) or a structural change (update the model).

Specifically check:
- Is Scenic still tracking to STR losses, or has something changed?
- Are insurance costs accelerating faster than the 8%/yr assumption?
- Is Due From Shoreward growing or distributing normally?
```

### Quarterly strategic review
```
Do a full quarterly portfolio review using the skill yarash-eretz-analysis.

1. Pull YTD 2026 P&L by Class from QuickBooks
2. Compare actuals to the model's baseline in historical-pl-by-property.json
3. Compare to base-case projections in scenario-outcomes.json under the current scenario
   (check data/model-parameters.json for which scenario we're in if tracked)
4. Identify the top 3 variances and categorize: timing / structural / macro
5. Recommend any model parameter updates in model-parameters.json
6. Flag any material risks that warrant revisiting the core recommendation
7. Output a 1-page memo suitable for sharing with Mary Jo
```

### Annual refresh
```
Perform the annual portfolio refresh using skill yarash-eretz-analysis:

1. Pull full-year P&L and updated Balance Sheet from QBO
2. Update each property's current_value in portfolio-master.json based on Zillow, realtor estimates, recent comps
3. Re-annualize per-property P&L line items with the additional year of data
4. Re-run the 5-year projections with updated baselines
5. Re-score the mission-weighted decision matrix
6. Produce an "Annual Review Memo" that answers: Is the active recommendation
   still the right one? What's changed? What should we watch?
```

## What Claude Code should do (guardrails)

- **Always prefer live QBO data** over model baselines when they disagree, for current-state questions
- **Flag** when live data differs materially from model assumptions — don't silently update without explicit user permission
- **Preserve the model files** in the skill as historical reference; modify in-memory for analysis, only overwrite files with explicit approval
- **Respect the priority matrix** — highest-dollar answer isn't automatically the right answer
- **Remember Shoreward timing** — the "Due From Shoreward" on BS is real receivable, not missing revenue
