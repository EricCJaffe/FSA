# Runbook

## Local Development

```bash
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build (run before committing)
npm run lint       # lint check
```

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

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

## QBO Sync (once configured)

- **Manual sync:** triggered from `/dashboard` UI — calls `/api/qbo/sync`
- **Scheduled sync:** Supabase edge function (cron) — runs on configurable close date
- **Sync status:** visible in `qbo_sync_records` table and UI sync history
- **Token refresh:** automatic via QBO refresh token (30-day expiry window)
- **On sync failure:** check `error_message` in `qbo_sync_records`; re-auth at `/api/qbo/connect` if tokens expired

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

## Checking Audit Logs

```sql
SELECT * FROM audit_log
WHERE org_id = '<org-uuid>'
ORDER BY created_at DESC
LIMIT 100;
```

Access restricted to `family_office_admin` and `org_admin` via RLS.
