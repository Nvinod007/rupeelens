# 1. Product summary & HLD

**Version:** 1.0 · **Status:** Draft · **Last updated:** 2026-06

## 1.1 Overview

Rupeelens is a personal multi-bank UPI/transaction aggregator for India. Users link bank accounts via **Setu Account Aggregator (AA)**, ingest transactions into **PostgreSQL**, and view a unified ledger in **Next.js**.

## 1.2 Core stack

| Layer | Technology | Purpose |
| ----- | ---------- | ------- |
| Data aggregation | Setu AA | RBI-licensed read access to bank data (with user consent) |
| Backend | NestJS (`rupeelens-be`) | REST API, webhooks, ETL |
| Frontend | Next.js (`rupeelens-fe`) | Dashboard, consent UI |
| Database | PostgreSQL | Users, consents, accounts, transactions |
| Hosting | Supabase and/or Docker | Managed Postgres or local dev |
| Auth (planned) | Supabase Auth + RLS | Login; row isolation |

## 1.3 Capabilities

- Multi-bank aggregation via Setu consent flow
- UPI narration parsing (merchant, category)
- Idempotent ingestion (`accountId` + `externalId`)
- Webhook-driven fetch (`FINANCIAL_DATA_READY`)
- Filterable transaction ledger

---

## 2. High-level design (HLD)

### 2.1 Architecture (ASCII)

```text
┌─────────────────────────────────────────────────────────────┐
│                     RUPEELENS SYSTEM                        │
│  rupeelens-fe (:3000)  ←HTTP→  rupeelens-be (:3001/api)     │
│                                      │ Prisma               │
│                                      ▼                      │
│                              PostgreSQL                     │
└─────────────────────────────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Setu AA API (consent + fetch)   Setu Webhooks → POST /api  │
└─────────────────────────────────────────────────────────────┘
```

Visual: [HLD cloud diagram](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=UXdwDIDapTBPZYNZZI_d) · [source](./diagrams/hld-cloud.md)

### 2.2 Components

| Component | Description | Port / path |
| --------- | ----------- | ----------- |
| `rupeelens-fe` | Next.js dashboard, consent UI | `:3000` |
| `rupeelens-be` | Nest API, webhooks, ingestion | `:3001/api` |
| PostgreSQL | Primary store | `:5432` |
| Setu AA API | Consent + financial data fetch | External |
| Setu webhooks | Inbound events | `POST /api/webhooks/setu` |
| Async worker | _(Future)_ ETL queue / retries | Queue |

### 2.3 Data flow summary

1. User starts consent in the frontend.
2. Backend creates `Consent` (PENDING) and returns Setu redirect URL.
3. User approves in bank AA UI.
4. Setu webhook updates consent / signals data ready.
5. Backend fetches financial JSON from Setu.
6. `IngestionService` normalizes and upserts rows.
7. Frontend loads ledger via `GET /api/transactions`.

**Rule:** Browser never talks to Postgres directly — only to `rupeelens-be`.
