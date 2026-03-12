# QuickBooks Online Integration Plan

_Last updated: 2026-03-12_

## Overview

Yarash Eretz Property Management uses QuickBooks Online (QBO) as its accounting system. Properties are tracked using QBO **Classes**, with each property mapped to a class. Two additional classes (Office, Overhead) capture non-property expenses.

This document captures the data model, integration strategy, and implementation plan based on actual QBO data exported on 2026-03-12.

---

## QBO Class Structure

| QBO Class Name | Maps To | Type |
|---|---|---|
| Property - 1323 C Solar Circle | 1323 C Solar Circle | LTR |
| Property - 1324B Solar Circle | 1324B Solar Circle | LTR |
| Property - 4056 Scenic Dr. | 4056 Scenic Dr. | LTR |
| Property - 5115 Sunderland | 5115 Sunderland | LTR |
| Property -4965 Fremont | 4965 Fremont | LTR |
| Office | (non-property) | Cost center |
| Overhead | (non-property) | Cost center |
| Property - New | (skip) | Acquisition placeholder |

**Note:** QBO class names are stored in `properties.qbo_class_name` and matched during sync. Once the QBO API is connected, `properties.qbo_class_id` will be populated with the QBO internal ID for reliable matching.

---

## Chart of Accounts (from Balance Sheet & P&L)

### Balance Sheet Accounts (as of 2026-03-12)

**Assets:**
| Account | Balance | Notes |
|---|---|---|
| BOA Checking | $73,520.32 | Primary operating account |
| Treasury Direct | $59,753.60 | Treasury securities |
| Blockfi Crypto Assets | $18,974.97 | Crypto holdings |
| Building | $721,291.87 | Includes $90,743.79 improvements |
| Accumulated Depreciation | -$155,313.32 | |
| Land | $141,753.00 | |
| Equipment | $23,376.20 | |
| Furnishings | $20,423.57 | |
| **Total Assets** | **$897,149.60** | |

**Liabilities:**
| Account | Balance | Notes |
|---|---|---|
| Mortgage - Ameris Bank | -$478.89 | Nearly paid off |
| Payroll Liabilities | $13.63 | |
| **Total Liabilities** | **-$465.26** | |

**Equity:** $897,614.86 (Owner's Investment $915,569.55 + Retained Earnings -$12,771.68 + Net Income -$5,183.01)

### P&L Accounts (Jan–Dec 2025)

**Income:**
| Account | Amount |
|---|---|
| Rental Income | $77,997.03 |

**Expenses:**
| Account | Amount | % of Income |
|---|---|---|
| Depreciation | $29,481.00 | 37.8% |
| Repairs & Maintenance | $15,825.11 | 20.3% |
| Taxes & Licenses | $14,643.99 | 18.8% |
| Insurance | $7,480.40 | 9.6% |
| Utilities | $5,846.56 | 7.5% |
| Management Fees | $4,830.75 | 6.2% |
| Office Supplies & Software | $1,420.88 | 1.8% |
| Lawncare | $892.22 | 1.1% |
| Bank Charges & Fees | $5.00 | 0.0% |
| **Total Expenses** | **$80,425.91** | |

**Other Income:**
| Account | Amount |
|---|---|
| Interest Income | $397.46 |

**Net Income:** -$2,031.42 (cash-positive ~$27K excluding depreciation)

---

## Key Financial Metrics (Portfolio-Level, 2025)

| Metric | Value | Notes |
|---|---|---|
| Gross Rental Income | $77,997 | |
| Operating Expenses (excl. depreciation) | $50,945 | |
| NOI (excl. depreciation) | $27,052 | Cash-basis operating income |
| NOI (incl. depreciation) | -$2,429 | GAAP basis |
| Total Assets | $897,150 | |
| Total Equity | $897,615 | Nearly 100% equity |
| Debt | $479 | Mortgage essentially paid off |
| LTV Ratio | ~0% | |
| Operating Expense Ratio | 65.3% | excl. depreciation: OER = OpEx / Gross Income |
| Cash-on-Cash Return | ~3.0% | NOI $27K / Equity $898K |

---

## Integration Phases

### Phase A: Manual Import (Current — No API needed)

**Status: Ready to implement**

Strategy: Export QBO reports as CSV, parse and import into `financial_line_items`.

1. **P&L by Class** — The critical missing report. This breaks down income and expenses per property (per QBO class). Needed to power per-property analytics.
2. **Balance Sheet** — Portfolio-level, imported as-is.
3. **Data mapping:**
   - Match `financial_line_items.property_id` via `qbo_class_name` lookup
   - Office/Overhead class → `property_id = NULL` (portfolio-level expense)
   - Store each line as: org_id, property_id, period_date, account_name, account_type, amount

**Action item:** Get P&L by Class export from QBO (Reports → Profit & Loss by Class → All dates or by year → Export to CSV/paste).

### Phase B: QBO API — OAuth + Read-Only Sync

**Status: Deferred — implement after dashboards are built**

1. **Intuit Developer Portal setup:**
   - Register app (sandbox first, then production)
   - OAuth 2.0 redirect URI: `{origin}/api/qbo/callback`
   - Scopes: `com.intuit.quickbooks.accounting` (read-only is sufficient)

2. **OAuth flow:**
   - `/api/qbo/connect` — Initiates OAuth, redirects to Intuit
   - `/api/qbo/callback` — Exchanges code for tokens, stores in `qbo_connections`
   - Token refresh: access tokens expire in 1 hour, refresh tokens in 100 days

3. **Env vars needed:**
   - `QBO_CLIENT_ID`
   - `QBO_CLIENT_SECRET`
   - `QBO_REDIRECT_URI`
   - `QBO_ENVIRONMENT` (sandbox | production)

4. **Sync engine:**
   - **Pull Classes:** `GET /v3/company/{realmId}/query?query=SELECT * FROM Class`
     - Populate `properties.qbo_class_id` for reliable matching
   - **Pull P&L by Class:** `GET /v3/company/{realmId}/reports/ProfitAndLoss?summarize_column_by=Class&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
     - Parse columnar response → one `financial_line_items` row per account × class × month
   - **Pull Balance Sheet:** `GET /v3/company/{realmId}/reports/BalanceSheet`
     - Portfolio-level import
   - **Sync frequency:** Manual trigger + optional monthly cron

5. **QBO API quirks to plan for:**
   - Report endpoints return a nested row/column structure (not flat JSON)
   - Class-based P&L columns are dynamic — need to match column headers to class names
   - Rate limiting: 500 requests/minute per realm
   - Sandbox data won't match production — test structure, not values

### Phase C: Automated Scheduled Sync

**Status: Future**

- Supabase Edge Function on cron (monthly, 1st of month)
- Pulls previous month's data
- Creates `qbo_sync_records` entry for audit trail
- Triggers monthly report generation + AI insights

---

## Data Flow Diagram

```
QBO (source of truth)
  │
  ├── Classes ──────────────► properties.qbo_class_id / qbo_class_name
  │
  ├── P&L by Class ────────► financial_line_items (per property, per month)
  │     account_name            ├── income lines (Rental Income)
  │     account_type            └── expense lines (Insurance, Repairs, etc.)
  │     amount
  │     period_date
  │
  ├── Balance Sheet ───────► financial_line_items (portfolio-level, property_id=NULL)
  │
  └── Transactions ────────► (Phase C: individual transaction detail, optional)
        │
        ▼
  financial_line_items
        │
        ▼
  Analytics engine (compute NOI, Cap Rate, DSCR, OER, etc.)
        │
        ▼
  monthly_reports + ai_insights
```

---

## Immediate Next Steps

1. ~~Seed 5 properties with QBO class names~~ ✅ Done
2. **Get P&L by Class** from QBO (needed for per-property analytics)
3. Build CSV/text import for financial data
4. Build per-property + portfolio analytics dashboards
5. Circle back to QBO API integration after dashboards prove out the data model
