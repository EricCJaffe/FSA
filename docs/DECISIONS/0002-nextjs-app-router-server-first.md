# 0002 — Next.js App Router, Server Components First

**Date:** 2026-03-12
**Status:** Accepted

## Context
This project requires: server-side Supabase session handling (to avoid token exposure), route-level auth protection, server-side data fetching for financial dashboards, and future API route handlers for QBO OAuth and webhooks. A pure client-side SPA (e.g., Vite + React as used in HoneylakeOS) would require more explicit API layer work to keep secrets off the client.

## Decision
Use **Next.js 14+ with the App Router** and a **Server Components by default** convention:

- All components are Server Components unless they require interactivity or browser APIs, in which case they are explicitly marked `'use client'`
- Supabase server client (`src/lib/supabase/server.ts`) used in Server Components and Route Handlers
- Supabase browser client (`src/lib/supabase/client.ts`) used only in Client Components
- Route Handlers (`app/api/`) for QBO OAuth callbacks, webhook endpoints, and any privileged server operations
- Next.js middleware (`src/middleware.ts`) for auth session refresh and route protection

## Consequences
- **Easier:** Secrets (service role key, QBO tokens, AI keys) never reach the browser — they stay in Server Components and Route Handlers by design.
- **Easier:** Financial data fetched server-side means no loading spinners for primary dashboard data — faster perceived performance.
- **Easier:** Supabase SSR (`@supabase/ssr`) integrates cleanly with Next.js cookie-based sessions via middleware.
- **Harder:** The client/server component split requires discipline — passing server data to client components via props, not shared state. Developers must understand which context they're in.
- **Harder:** Next.js App Router is more opinionated than a plain SPA — folder-based routing, layout nesting, and the `async` Server Component model have a learning curve.
- **Tradeoff:** Chose Next.js over continuing the Vite pattern used in other BusinessOS modules because the auth/secret management benefits outweigh the added complexity for a financial data app.
