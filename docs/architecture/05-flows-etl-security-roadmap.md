# 5. Flows, ETL, security & roadmap

Diagrams: [Sequence](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=NzqFf_b9A33X0SQizD5v) ([source](./diagrams/sequence-consent-webhook.md)) · [ETL flowchart](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=SvriT_StUjgcu2Tvn4aw) ([source](./diagrams/etl-flowchart.md))

## 5.1 Consent flow

1. User → FE: “Link bank”
2. FE → BE: `POST /api/consents` (JWT)
3. BE → DB: insert `Consent` PENDING
4. BE → Setu: create consent
5. BE → FE: `redirectUrl`
6. FE → User: redirect to Setu / bank AA
7. User approves
8. Setu → BE: webhook `CONSENT_STATUS_UPDATE`
9. BE → DB: `Consent` ACTIVE

## 5.2 Webhook + ingest flow

1. Setu → BE: `FINANCIAL_DATA_READY` + HMAC header
2. BE: verify signature (reject if invalid)
3. BE: log `WebhookDelivery`
4. BE → Setu: fetch financial data (read-only on bank side)
5. BE: ETL — parse UPI, upsert accounts/transactions
6. BE → Setu: `200 OK`

## 5.3 Ledger read flow

1. User → FE: open dashboard
2. FE → BE: `GET /api/transactions` (JWT)
3. BE → DB: `findMany` filtered by `userId`
4. FE: render table/charts

## 5.4 ETL pipeline (plain language)

| Step | What | Example |
| ---- | ---- | ------- |
| **HMAC** | Prove webhook is from Setu | Wrong signature → ignore request |
| **Fetch** | Download txn JSON (webhook is only a ping) | “Data ready” → API call for rows |
| **Parse UPI** | Turn `UPI/swiggy@ybl/...` into merchant + label | Show “Payment to Swiggy” |
| **Idempotent upsert** | Insert once per Setu txn id | Retry webhook → no duplicate row |

**Not read-only for your app:** you **write** to Postgres. **Read-only for bank money:** AA does not move funds.

## 5.5 Security

| Risk | Mitigation |
| ---- | ---------- |
| Fake webhook | Validate HMAC with `SETU_WEBHOOK_SECRET` |
| Leaked Setu keys | Env only; never commit; rotate |
| Cross-user data leak | JWT on APIs; every query filters `userId` |
| Browser → DB | Never — API only |
| Sensitive rows | Treat transactions as PII; HTTPS in prod |
| Webhook endpoint | No JWT; signature is the auth |

## 5.6 Roadmap

| Phase | Deliverable |
| ----- | ----------- |
| 1 | Postgres + Prisma + Nest health + `GET /transactions` (seed data) |
| 2 | Auth (Supabase Auth or similar) + JWT guards |
| 3 | Setu sandbox consent + webhook + ingestion |
| 4 | FE ledger, filters, search |
| 5 | Deploy pipeline, monitoring, optional async worker |

Aligns with root [README](../../README.md) roadmap.
