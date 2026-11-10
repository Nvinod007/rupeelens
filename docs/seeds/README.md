# One-time data seeds

## Bulk transactions (recommended)

1. Open [Supabase SQL editor](https://supabase.com/dashboard) for your project.
2. Paste and run [`bulk-transactions-once.sql`](./bulk-transactions-once.sql).
3. Change the email in the `owner` CTE if it is not `vinodkumar.nelanakula@gmail.com`.
4. Refresh the app — **Insights** and **Transactions** should show ~43 rows (42 saved + 1 draft).

Uses `booked_at` in the last ~85 days so period filters and charts have data.

**Already ran an older seed?** If home shows only a few saved rows under “All time” but the API lists many, run [`fix-future-booked-at-from-bad-bulk.sql`](./fix-future-booked-at-from-bad-bulk.sql) once, then hard-refresh the app.

### API instead of SQL

There is no bulk-create endpoint. For a one-off without SQL you can:

- **Postman**: duplicate **Create (saved)** and use Collection Runner with a JSON data file (slow for 40+ rows).
- **Shell** (with a valid JWT in `ACCESS_TOKEN` and API on `http://localhost:4001`):

```bash
# Example: 3 creates only — extend the heredoc or loop a file for more.
API=http://localhost:4001
while read -r line; do
  curl -sS -X POST "$API/transactions" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
  -d "$line"
  echo
done <<'JSON'
{"title":"Morning chai","amount":45,"status":"saved","category":"Coffee & Snacks"}
{"title":"Swiggy lunch","amount":289,"status":"saved","category":"Food & Dining"}
{"title":"Metro card top-up","amount":500,"status":"saved","category":"Transport"}
JSON
```

SQL is faster and does not hit auth/rate limits.
