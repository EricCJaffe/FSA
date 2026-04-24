# Releases

## v0.4.0 — 2026-04-24
**Market Analyzer + Knowledge Base**
- AI-powered portfolio review with buy/sell/hold recommendations per property
- Deep market analysis: housing supply/demand, affordable housing deficit, submarket comparison, insurance trajectory
- Knowledge base ("second brain"): accumulated structured insights, tagged by category + asset class
- Asset allocation context: current vs recommended allocation, multi-asset class ready for future portfolio expansion
- Knowledge base viewer with category grouping and tag cloud
- Download PDF for all analysis reports

## v0.3.0 — 2026-04-24
**Deal Analyzer**
- Two-step deal analysis flow: AI property lookup from address → review/adjust → analyze
- Pure-function calculator: NOI, Cash-on-Cash, Gross Yield with verdict engine (Strong Recommend → Hard Pass)
- Portfolio comparison table (candidate vs existing properties)
- 5 sensitivity scenarios (HOA growth, rent recession, vacancy doubles, rent growth, expense increase)
- Due diligence checklist generator (HOA, property-level, market, financial validation)
- Outcome tracking (purchased, passed, negotiated)
- Download PDF with Foundation Stone Advisors branding

## v0.2.0 — 2026-04-23
**Analytics + Reports**
- QBO API live sync (P&L by Class + Balance Sheet, `summarize_column_by: 'Classes'`)
- Per-property + portfolio analytics dashboards (NOI, Cap Rate, CoC, DSCR, GRM, OER)
- Balance sheet detail breakdown (Assets, Liabilities, Equity line items)
- Month-over-month and YoY trend charts (Recharts)
- Monthly reports with period comparisons and trailing trend data
- Report commentary/annotations system
- Batch sync last 12 months, populate missing addresses
- AI Property Lookup on property detail page
- Date range picker with URL params and presets

## v0.1.0 — 2026-03-12
**Phase 1 Foundation**
- Next.js 14 + TypeScript + Tailwind scaffold
- Supabase project connected (`zkkxfcxqyojyznjnlrkt`)
- Initial DB schema: 9 tables, 4-tier RBAC, RLS, audit log
- Supabase SSR wiring (browser + server + middleware)
- Auth middleware (route protection for `/dashboard/**`)
- Email auth flow (login, callback, middleware redirect)
- Property registry: list, detail, add/edit pages
- Dashboard shell with sidebar navigation
- Vercel deployment live at `fsa-lake.vercel.app`
- CLAUDE.md + full docs structure + ADRs
