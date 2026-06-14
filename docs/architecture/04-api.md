# 4. API endpoints

Base URL (local): `http://localhost:3001/api`

## 4.1 Reference

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/consents` | JWT | Start AA consent |
| `GET` | `/consents/:id` | JWT | Consent status |
| `POST` | `/webhooks/setu` | HMAC | Setu callbacks |
| `GET` | `/transactions` | JWT | Ledger (filters, pagination) |
| `GET` | `/accounts` | JWT | Linked bank accounts |
| `GET` | `/health` | None | Health + DB ping |

## 4.2 `POST /consents`

```typescript
interface CreateConsentDto {
  purpose: string;
  fiTypes: string[]; // e.g. ["DEPOSIT"]
  dateRange: { from: string; to: string };
}

interface ConsentResponseDto {
  id: string;
  setuConsentId: string;
  status: ConsentStatus;
  redirectUrl: string;
  createdAt: string;
}
```

## 4.3 `GET /transactions`

Query: `accountId`, `direction`, `category`, `merchantName`, `fromDate`, `toDate`, `minAmount`, `maxAmount`, `page`, `limit` (max 100).

```typescript
interface PaginatedTransactionsDto {
  data: TransactionDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface TransactionDto {
  id: string;
  accountId: string;
  amount: string;
  direction: "CREDIT" | "DEBIT";
  narration: string;
  merchantName: string | null;
  category: string | null;
  bookedAt: string;
  bankName: string;
  maskedAccountNumber: string;
}
```

## 4.4 `POST /webhooks/setu`

```typescript
interface SetuWebhookPayload {
  type: string; // CONSENT_STATUS_UPDATE | FINANCIAL_DATA_READY
  timestamp: string;
  consentId: string;
  data: { status?: string; sessionId?: string };
}

// Response
{ status: "received" }
```

Setu field mapping: see [setu-field-map template](../learnings/be/setu-field-map-TEMPLATE.md).
