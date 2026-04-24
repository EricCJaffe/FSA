# API Routes

_Last updated: 2026-04-24_

All API routes are in `src/app/api/`. All require authentication unless noted.

---

## Deal Analyzer

### `POST /api/deal-analyses`
Run a new deal analysis. Requires `org_admin` or `family_office_admin` role.

**Body:** `{ propertyName, propertyAddress, propertyType, allInCost, monthlyRent, ... }`
**Response:** `{ success, analysis, result }`

### `GET /api/deal-analyses`
List all deal analyses for the user's org.

### `GET /api/deal-analyses/[id]`
Get a single deal analysis by ID.

### `PATCH /api/deal-analyses/[id]`
Update user notes, outcome, or outcome notes (immutable financial data).

### `DELETE /api/deal-analyses/[id]`
Delete a deal analysis. Requires admin role + org ownership.

### `POST /api/deal-analyses/lookup`
AI property lookup from address. Returns estimated taxes, insurance, rent, beds/baths/sqft, etc.

**Body:** `{ address, propertyType?, askingPrice? }`
**Response:** `{ success, lookup, model }`
**Max duration:** 60s

---

## Market Analyzer

### `POST /api/market-analyses`
Run a new market analysis. Requires admin role. Fetches portfolio properties, existing knowledge base, and calls AI for comprehensive analysis.

**Body:** `{ analysisType?, horizon?, additionalContext? }`
**Response:** `{ success, analysis, knowledgeEntriesCreated }`
**Max duration:** 120s

### `GET /api/market-analyses`
List all market analyses for the user's org.

### `GET /api/market-analyses/[id]`
Get a single market analysis with associated knowledge entries.

### `DELETE /api/market-analyses/[id]`
Delete a market analysis and its associated knowledge entries.

---

## Knowledge Base

### `GET /api/knowledge-base`
List knowledge entries. Supports query params: `category`, `assetClass`, `search`.

### `POST /api/knowledge-base`
Add a manual knowledge entry. Requires admin role.

**Body:** `{ title, content, category, assetClass?, tags?, confidence? }`

### `DELETE /api/knowledge-base/[id]`
Delete a knowledge entry. Requires admin role.

---

## QBO Integration

### `GET /api/qbo/connect`
Initiates QBO OAuth flow. Redirects to Intuit authorization.

### `GET /api/qbo/callback`
OAuth callback from Intuit. Stores tokens in `qbo_connections`.

### `POST /api/qbo/sync`
Trigger a QBO data sync (P&L by Class + Balance Sheet).

**Body:** `{ startDate, endDate, type? }`

### `GET /api/qbo/status`
Get current QBO connection status and recent sync records.

### `POST /api/qbo/disconnect`
Disconnect QBO integration and remove stored tokens.

---

## Reports

### `POST /api/reports`
Generate a monthly report for a specific period.

**Body:** `{ month, year }`

### `POST /api/reports/publish`
Toggle publish status of a report.

### `POST /api/reports/commentary`
Add commentary/annotation to a report.

---

## Other

### `POST /api/insights`
Generate AI insights for a property or portfolio.

### `POST /api/insights/property-lookup`
AI-powered property market analysis (used on property detail page).

### `POST /api/properties/populate-addresses`
Populate missing property addresses with defaults.
