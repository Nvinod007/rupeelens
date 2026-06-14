# Setu → Rupeelens field map (fill this in)

Copy this file to `setu-field-map.md` in this folder when you read Setu docs.  
Do not commit real customer data here — only field names.

## Consent

| Setu field / concept | Our table.column | Notes |
|----------------------|------------------|-------|
| | `Consent.setuConsentId` | |
| | `Consent.status` | PENDING / ACTIVE / … |

## Account

| Setu field | Our column | Notes |
|------------|------------|-------|
| | `BankAccount.setuAccountId` | |
| | `BankAccount.maskedAccountNumber` | |

## Transaction

| Setu field | Our column | Notes |
|------------|------------|-------|
| | `Transaction.externalId` | For upsert key |
| | `Transaction.narration` | Parsed label |
| | `Transaction.rawNarration` | Original string if parse fails |

## Webhook events

| Event type | Our action |
|------------|------------|
| `FINANCIAL_DATA_READY` | Fetch session → ingest |

## API endpoints (your design)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/consents` | Start consent |
| POST | `/api/webhooks/setu` | Setu callback |
| GET | `/api/transactions` | Ledger for FE |
