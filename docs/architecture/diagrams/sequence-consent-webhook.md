# Sequence (consent + webhook)

**View in Eraser (sequence UI):** [Open diagram](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=NzqFf_b9A33X0SQizD5v&layout=canvas)

GitHub does **not** render `eraser` blocks. Use the link above, or in Eraser: **+ Diagram → Sequence** → paste into the diagram **code** panel.

```eraser
title Rupeelens Consent and Webhook Flow

User [icon: user]
FE [icon: nextjs, label: rupeelens-fe]
BE [icon: nestjs, label: rupeelens-be]
DB [icon: postgresql, label: PostgreSQL]
Setu [icon: globe, label: Setu AA]

User > FE: Link bank account
FE > BE: POST /api/consents (JWT)
BE > DB: Create Consent PENDING
BE > Setu: Create consent request
Setu --> BE: redirectUrl + setuConsentId
BE --> FE: ConsentResponseDto
FE > User: Redirect to Setu / bank AA
User > Setu: Approve consent
Setu > BE: POST /api/webhooks/setu CONSENT_STATUS_UPDATE
BE > DB: Update Consent ACTIVE

Setu > BE: POST /api/webhooks/setu FINANCIAL_DATA_READY
BE > BE: Validate HMAC signature
BE > Setu: Fetch financial data (sessionId)
Setu --> BE: Accounts + transactions JSON
BE > BE: IngestionService parse + upsert
BE > DB: Upsert BankAccount, Transaction
BE --> Setu: 200 OK

User > FE: Open dashboard
FE > BE: GET /api/transactions (JWT)
BE > DB: findMany by userId
DB --> BE: rows
BE --> FE: PaginatedTransactionsDto
FE --> User: Ledger UI
```
