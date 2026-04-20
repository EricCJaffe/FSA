# Prompt Template: Re-Run Scenarios with New Assumptions

## When to use this

When the user wants to test "what if" scenarios — different rent levels, market conditions, new properties, changed assumptions. The base model in this skill is a starting point, not a cage.

## Suggested prompts

### Sensitivity analysis on a single variable
```
Using skill yarash-eretz-analysis, re-run the 5-year projection for all 6 scenarios
assuming [VARIABLE] changes to [VALUE]. Show me:
- Which scenarios are most sensitive to this change
- Which scenarios flip in ranking
- Whether the recommendation changes

Examples of [VARIABLE]:
- Jacksonville SFH appreciation (base 2.5%)
- Florida insurance inflation (base 8%)
- Scenic LTR rent (base $3,000/mo)
- S&P 500 long-run return (base 8.5%)
```

### Adding a new property to the analysis
```
Using skill yarash-eretz-analysis, model a new scenario where we keep everything current
(Scenario 2 baseline) and add [NEW PROPERTY] with these parameters:
- Purchase price: $X
- Cash down: $Y
- Mortgage rate: Z%
- Expected gross rent/revenue: $A/month or $B/year
- Market type: [LTR / STR / lifestyle]
- Geographic market: [market name from model-parameters.json, or specify assumptions]

Output:
- 5-year projection vs Scenario 6 (current recommendation)
- Risk analysis vs existing concentration
- Mission-fit scoring
- Concrete recommendation
```

### Downside stress test
```
Using skill yarash-eretz-analysis and particularly ai-stress-test.md, model what happens
to the current recommendation (Scenario 6) under these combined stresses:
- Major hurricane damages 2 of the 4 LTR properties
- S&P 500 in a 30% drawdown
- Florida insurance increases 25% in one year
- LTR Scenic tenant breaks lease mid-year

Output:
- Cash flow impact by year
- Net worth impact at year 3
- Recovery trajectory
- Decision point: when does this trigger a different strategy?
```

### Lifestyle choice modeling
```
Using skill yarash-eretz-analysis, help me model a version of Scenario 6 that preserves
some Scenic personal use. Examples:
- 10-month LTR lease + 2 months owner use (legally tricky but possible)
- Seasonal lease (Oct-May) + summer personal use
- Mid-term furnished rental (3-6 month leases) with gaps

For each variant show:
- Realistic rental income (probably lower than full LTR)
- Tax treatment implications
- Tenant pool feasibility
- Vs. clean Scenario 6 in 5-year outcome
```

### Sell Scenic + alternative redeployment
```
Using skill yarash-eretz-analysis, I'm considering Scenario 3 variants. Model these:

Variant 3a: Sell Scenic, deploy 100% to S&P 500 (base model already has this)
Variant 3b: Sell Scenic, deploy 60% S&P / 30% bonds / 10% cash
Variant 3c: Sell Scenic, buy 2-3 more Jax LTR properties for ~$150K each
Variant 3d: Sell Scenic, use as down payment on commercial/multifamily property

For each show:
- 5/10/20 year outcomes
- Risk profile
- Mission-fit
- Execution complexity
```

## What Claude Code should do

- **Cite the data sources** — which file in the skill the numbers came from, which parameters were changed
- **Don't overwrite the model files** without explicit user permission — these are the baseline reference
- **Flag when assumptions are speculative** — we have high confidence on current state, medium on 5-year, low on 20-year
- **Offer to save new scenarios** — if a new analysis is valuable, suggest creating `scenarios/[name].md` with the results
- **Maintain mission alignment** — when presenting recommendations, surface the God First > Health > Family > Impact lens
