# V2 progress (living doc)

Last updated: 2026-11-10

**V2 goal:** Insights + scale (see `rupeelens-roadmap.html`).

**Status: code complete.** Remaining: production pass (below).

| Item | Status | Notes |
|------|--------|--------|
| Insights `/insights` | **Done** | Period tabs, donut + category list, spend-over-time bars, CSV export |
| Transactions `/transactions` | **Done** | Debounced search, category, status (server-side), infinite scroll |
| Typo-tolerant search | **Done** | Migration `005_fuzzy_search.sql` |
| Cursor pagination API | **Done** | `TransactionListPage`, `?cursor=` |
| Request cancellation | **Done** | AbortSignal + 20 s timeout |
| Export data | **Done** | Period CSV on Insights |
| Postman + seed SQL | **Done** | `docs/postman`, `docs/seeds` |
| AI quota / usage | **Done** | Migration `006_ai_usage.sql`; `AI_DAILY_LIMIT` (default 50); usage in Settings |
| Structured logging | **Done** | JSON in prod, request id + latency, health probes skipped |
| Captures schema | Moved to V3 | Nothing in V2 consumes it |
| Error tracking + metrics | Moved to V3 | Logs and request ids are in place |
| FE hook/component tests | Moved to V3 | Add on request |

## Production pass (to ship V2)

1. Run `005_fuzzy_search.sql` and `006_ai_usage.sql` in the Supabase SQL editor.
2. Optional: set `AI_DAILY_LIMIT` on the API host (see `apps/rupeelens-api/.env.example`).
3. Deploy API + FE together (list response shape changed; `status` filtered server-side; new `/settings/ai-usage`).
4. Smoke-test Insights, Transactions (search incl. a typo), and Settings usage line; this is also the open V1 smoke test.

**Manual checks:** `rupeelens-test-suites.html` → suites **dash**, **txpage** (V2).

**Behaviour notes**
- Quota is consumed when an AI parse starts (before the Gemini call), counted per IST day.
- If the usage store fails, parsing is allowed (quota never takes the product down).
- Without Supabase configured, usage is in-memory and resets on restart.
