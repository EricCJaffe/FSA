# Integrations

## Supabase
- **Status:** Connected
- Auth, Postgres, RLS, edge functions (future)
- See `docs/SUPABASE.md` for full details

---

## Vercel
- **Status:** Connected, auto-deploying
- Project: `fsa` (`prj_gIZUuzSvsk5SxdH9cXIfCgkW7ztN`)
- Team: `ericcjaffes-projects` (`team_mVKn9BOkHHbryfcVkok963Br`)
- Production URL: `fsa-lake.vercel.app`
- Git integration: auto-deploys on push to `main`
- See `docs/DEPLOYMENT.md` for deploy process

---

## QuickBooks Online (QBO)
- **Status:** Connected, live sync working
- **Purpose:** Primary financial data source — P&L by Class (per-property), Balance Sheet
- **Auth:** OAuth 2.0 (Intuit Developer Portal)
- **Scopes:** `com.intuit.quickbooks.accounting`
- **Tokens stored:** `qbo_connections` table (access + refresh tokens, expiry)
- **Sync features:**
  - Manual sync from `/dashboard/settings`
  - Batch sync last 12 months
  - P&L by Class (`summarize_column_by: 'Classes'`) — per-property income/expense
  - Balance Sheet sync with dedup
- **API routes:** `/api/qbo/connect`, `/api/qbo/callback`, `/api/qbo/sync`, `/api/qbo/status`, `/api/qbo/disconnect`

---

## Microsoft Auth (Azure AD)
- **Status:** Not yet configured — Phase 1
- **Purpose:** SSO for family office users (Microsoft accounts)
- **Auth:** Supabase OAuth provider (Azure AD)
- **Setup steps:**
  1. Create App Registration in Azure portal
  2. Configure redirect URI: `https://zkkxfcxqyojyznjnlrkt.supabase.co/auth/v1/callback`
  3. Add Azure AD as OAuth provider in Supabase dashboard (Auth → Providers)
  4. Add `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` to Supabase secrets

---

## iTrip (STR Data)
- **Status:** Research needed — Phase 1
- **Purpose:** 5 years of STR historical data (occupancy, ADR, RevPAN, platform fees)
- **Open questions:**
  - Is a direct API available from iTrip?
  - What export formats are available (CSV, JSON)?
  - Frequency of available data exports
- **Next step:** Contact iTrip support to determine integration path

---

## AI / LLM (Multi-Model)
- **Status:** Connected (OpenAI GPT-4o primary, Anthropic Claude fallback)
- **Purpose:** Property health summaries, anomaly detection, monthly narratives, deal property lookup, market analysis, knowledge base generation
- **Architecture:** Multi-model routing (`src/lib/ai/client.ts`)
  - GPT-4o (OpenAI) — primary for all AI features
  - Claude (Anthropic) — automatic fallback if OpenAI fails
  - Token limit configurable per call (default 2000, market analysis uses 12000)
- **AI-Powered Features:**
  - Property health summaries and anomaly detection (`ai_insights` table)
  - Monthly report narrative generation
  - Deal Analyzer property lookup (estimates taxes, insurance, rent from address)
  - Market Analyzer portfolio review (buy/sell/hold recommendations, market conditions)
  - Knowledge base entry generation (accumulated insights over time)
- **Persistence:** `ai_insights`, `deal_analyses`, `market_analyses`, `knowledge_entries` tables
- **Setup:** Add `OPENAI_API_KEY` (required) and optionally `ANTHROPIC_API_KEY` to env vars

---

## SendGrid (Email)
- **Status:** Not yet configured — Phase 1
- **Purpose:** Monthly report notifications, anomaly alerts
- **Setup:** Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` to Vercel env vars

---

## Zillow API
- **Status:** Phase 2 research
- **Purpose:** Property market values + rent estimates + neighborhood trends

---

## Plaid
- **Status:** Phase 2 (optional)
- **Purpose:** Direct bank account connections where QBO doesn't cover
