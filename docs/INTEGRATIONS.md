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
- **Status:** Not yet configured — Phase 1
- **Purpose:** Primary financial data source — P&L, transactions, Chart of Accounts by class (each property = one QBO class)
- **Auth:** OAuth 2.0 (Intuit Developer Portal)
- **Scopes needed:** `com.intuit.quickbooks.accounting`
- **Tokens stored:** `qbo_connections` table (access + refresh tokens, expiry)
- **Sync:** Scheduled (on monthly close) + manual refresh
- **Setup steps:**
  1. Create app at https://developer.intuit.com
  2. Set redirect URI: `https://fsa-lake.vercel.app/api/qbo/callback`
  3. Add `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_REDIRECT_URI`, `QBO_ENVIRONMENT` to Vercel env vars
  4. Build OAuth flow in `/api/qbo/connect` and `/api/qbo/callback`

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
- **Status:** Not yet configured — Phase 1
- **Purpose:** Property health summaries, anomaly detection, monthly narratives, portfolio insights
- **Architecture:** Multi-model routing
  - Claude (Anthropic) — primary, complex analysis
  - GPT-4o (OpenAI) — fallback
  - Lighter models — routine/frequent queries
- **Persistence:** All insights stored in `ai_insights` table with model used, prompt hash, input context
- **Setup:** Add `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` to Vercel env vars

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
