# Runbook

## Local Development

```bash
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build (run before committing)
npm run lint       # lint check
```

Requires `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin DB operations in Deal/Market Analyzer)
- `OPENAI_API_KEY` (for AI features: property lookup, market analysis, insights)

---

## Deployment

Deployments trigger automatically when code is pushed to `main` via GitHub → Vercel git integration.

To manually trigger a redeploy: push an empty commit or use the Vercel dashboard.

See `docs/DEPLOYMENT.md` for full details.

---

## Database Migrations

1. Write migration SQL in `supabase/migrations/YYYYMMDDHHMMSS_<slug>.sql`
2. Apply via Supabase MCP tool or `supabase db push` (if CLI configured)
3. Update `docs/SUPABASE.md` to reflect schema changes
4. Commit migration file + doc update together

**Never modify existing migration files.** Write a new migration for any changes.

---

## Adding a New User

1. User authenticates via Supabase (email or Microsoft SSO)
2. An `org_admin` or `family_office_admin` inserts a row in `user_org_roles`:
   ```sql
   INSERT INTO user_org_roles (user_id, org_id, role)
   VALUES ('<user-uuid>', '<org-uuid>', 'org_viewer');
   ```
3. User now has access to that org's data per their role

---

## Adding a New Property

1. Navigate to `/dashboard/properties` → Add Property
2. Fill in: name, address, type (LTR/STR), purchase details, mortgage, market value
3. Map to QBO class: enter the class name/ID from QuickBooks
4. Save → property appears in registry and will be included in next QBO sync

---

## Rotating Secrets

1. Generate new secret (Supabase / Intuit / Anthropic dashboard)
2. Update in Vercel: Project → Settings → Environment Variables
3. Trigger redeploy
4. Revoke old secret in the issuing service
5. Update `docs/ENVIRONMENT.md` if the variable name changed

---

## Running a Deal Analysis

1. Navigate to `/dashboard/deal-analyzer` → New Analysis
2. **Step 1 — Lookup:** Enter property address + optional asking price → click "Lookup Property"
3. AI researches the property and auto-populates: beds, baths, sqft, county, year built, estimated taxes, insurance, rent, HOA, repairs
4. **Step 2 — Review:** Adjust any estimates, set the all-in cost → click "Analyze Deal"
5. Results include: verdict (Strong Recommend → Hard Pass), NOI, Cash-on-Cash, portfolio comparison, sensitivity scenarios, due diligence checklist
6. Download PDF to share with realtor or partners

---

## Running a Market Analysis

1. Navigate to `/dashboard/market-analyzer` → New Analysis
2. Select outlook horizon (6/12/24 months) and add optional context
3. AI analyzes the full portfolio against current market conditions
4. Results include: buy/sell/hold per property, market conditions, asset allocation, portfolio strategy, risk assessment
5. Knowledge base entries are automatically generated and accumulated
6. View accumulated knowledge at `/dashboard/market-analyzer/knowledge`
7. Download PDF for quarterly review sharing

---

## QBO Sync

- **Manual sync:** `/dashboard/settings` → Sync Now (syncs P&L by Class + Balance Sheet for current period)
- **Batch sync:** `/dashboard/settings` → Sync Last 12 Months (catches up historical data)
- **Sync status:** visible on settings page with sync history
- **Token refresh:** automatic via QBO refresh token
- **On sync failure:** check error message on settings page; re-auth at `/dashboard/settings` if tokens expired

---

## Checking Audit Logs

```sql
SELECT * FROM audit_log
WHERE org_id = '<org-uuid>'
ORDER BY created_at DESC
LIMIT 100;
```

Access restricted to `family_office_admin` and `org_admin` via RLS.
