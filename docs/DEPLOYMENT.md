# Deployment

## Overview
- **Host:** Vercel
- **Project:** `fsa` (`prj_gIZUuzSvsk5SxdH9cXIfCgkW7ztN`)
- **Team:** `ericcjaffes-projects`
- **Production URL:** `fsa-lake.vercel.app`
- **Git integration:** push to `main` → auto-deploy to production

## Environments
| Environment | Branch | URL |
|---|---|---|
| Production | `main` | `fsa-lake.vercel.app` |
| Preview | any other branch | auto-generated `fsa-<hash>-ericcjaffes-projects.vercel.app` |

## Deploy Process
1. `npm run build` locally to verify no build errors
2. Commit and push to `main`
3. Vercel detects push, builds, and deploys automatically
4. Monitor build in Vercel dashboard or via MCP `get_deployment`

## Required Env Vars (Vercel Dashboard)
Set at: Vercel → fsa project → Settings → Environment Variables

| Variable | Environment |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview |
| _(QBO, AI, SendGrid — see `docs/ENVIRONMENT.md`)_ | As configured |

## Rollback
In Vercel dashboard → Deployments → select a prior deployment → Promote to Production.

## Framework Configuration
- Framework: Next.js (auto-detected)
- Node version: 24.x
- Build command: `npm run build` (default)
- Output directory: `.next` (default)
