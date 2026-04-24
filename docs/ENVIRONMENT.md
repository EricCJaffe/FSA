# Environment Variables

## How Env Vars Work
- **`NEXT_PUBLIC_*`** — exposed to the browser. Only use for non-secret public config.
- **Non-prefixed** — server-only. Never accessible in client code.
- Local dev: `.env.local` (gitignored)
- Production: set in Vercel dashboard → Project → Settings → Environment Variables

---

## Current Variables

### Supabase (required — Phase 1)
| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/publishable key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Service role key — bypasses RLS. Never expose. |

> Supabase project: `zkkxfcxqyojyznjnlrkt` (us-west-2)
> URL: `https://zkkxfcxqyojyznjnlrkt.supabase.co`

---

### QuickBooks Online (configured)
| Variable | Scope | Description |
|---|---|---|
| `QBO_CLIENT_ID` | Server only | QBO app Client ID from Intuit Developer Portal |
| `QBO_CLIENT_SECRET` | Server only | QBO app Client Secret |
| `QBO_REDIRECT_URI` | Server only | OAuth callback URL (e.g. `https://fsa-lake.vercel.app/api/qbo/callback`) |
| `QBO_ENVIRONMENT` | Server only | `sandbox` or `production` |

> Setup: https://developer.intuit.com — create app, OAuth 2.0, Accounting scope

---

### Microsoft / Azure AD Auth (Phase 1 — not yet configured)
| Variable | Scope | Description |
|---|---|---|
| `MICROSOFT_CLIENT_ID` | Server only | Azure AD app registration Client ID |
| `MICROSOFT_CLIENT_SECRET` | Server only | Azure AD app Client Secret |
| `MICROSOFT_TENANT_ID` | Server only | Azure AD tenant ID (or `common` for multi-tenant) |

> Configured in Supabase dashboard as an OAuth provider (Azure AD), not directly in Next.js

---

### AI / LLM (configured)
| Variable | Scope | Description |
|---|---|---|
| `OPENAI_API_KEY` | Server only | GPT-4o API key (primary model for all AI features) |
| `ANTHROPIC_API_KEY` | Server only | Claude API key (automatic fallback if OpenAI fails) |

> Used by: Deal Analyzer property lookup, Market Analyzer portfolio review, AI insights, monthly report narratives, knowledge base generation

---

### Email (Phase 1 — not yet configured)
| Variable | Scope | Description |
|---|---|---|
| `SENDGRID_API_KEY` | Server only | SendGrid API key for email notifications |
| `SENDGRID_FROM_EMAIL` | Server only | Verified sender address |

---

## Rules
- **Never** put `SUPABASE_SERVICE_ROLE_KEY`, `QBO_CLIENT_SECRET`, or any API key in a `NEXT_PUBLIC_*` var
- When adding a new var: update this file in the same commit
- Rotate secrets by updating Vercel env vars + redeploying — no code change needed
