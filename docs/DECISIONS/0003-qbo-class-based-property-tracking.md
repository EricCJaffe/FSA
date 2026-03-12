# 0003 — QuickBooks Class-Based Property Tracking

**Date:** 2026-03-12
**Status:** Accepted

## Context
All property financials are currently maintained in QuickBooks Online. The portfolio owner tracks income and expenses per property using QBO's **class** feature (each property = one class). This is the existing operational system and changing it would disrupt day-to-day bookkeeping.

The question is how FSA should integrate: (a) use QBO as the live source of truth on every page load, (b) sync QBO data into Supabase on a schedule and query Supabase, or (c) a hybrid.

## Decision
**Sync QBO data into Supabase; Supabase is the query layer.**

- QBO is the **write system of record** for all financial entries — bookkeeping stays in QBO unchanged
- FSA pulls data from QBO on a schedule (monthly close trigger) and on manual refresh
- Synced data stored in `financial_line_items` (P&L by account and class/property) per `qbo_sync_records`
- All FSA dashboards, analytics, and AI insights query **Supabase**, not QBO directly
- QBO connection details (realm_id, OAuth tokens) stored per org in `qbo_connections`
- Property ↔ QBO class mapping stored in `properties.qbo_class_id` / `qbo_class_name`

## Consequences
- **Easier:** Dashboard queries are fast Postgres queries — no QBO API latency on page load.
- **Easier:** Historical longitudinal analysis is possible once data is in Supabase — QBO API has limited lookback for some report types.
- **Easier:** AI insights run against local data, not live QBO calls — cheaper and more reliable.
- **Easier:** If QBO tokens expire or the API is down, dashboards still show the last synced data.
- **Harder:** Data is not real-time — there is a lag between a QBO entry and its appearance in FSA dashboards. Acceptable for monthly analysis workflow; not suitable for transaction-level real-time views.
- **Harder:** Sync errors must be surfaced clearly — users need to know when data is stale.
- **Tradeoff:** Chose scheduled sync over live API proxy because the use case (monthly analysis meetings, property performance review) does not require real-time data. The reliability and performance gains outweigh the freshness tradeoff.
