# 2. Low-level design (LLD)

## 2.1 Nx monorepo (target layout)

```text
rupeelens/
├── apps/
│   ├── rupeelens-be/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── main.ts              # global prefix api, port 3001
│   │   │   ├── app/app.module.ts
│   │   │   ├── prisma/              # PrismaService, PrismaModule
│   │   │   ├── consent/
│   │   │   ├── webhook/
│   │   │   ├── transactions/
│   │   │   ├── accounts/
│   │   │   ├── ingestion/
│   │   │   └── health/
│   │   └── project.json             # db-generate, db-migrate, db-studio
│   └── rupeelens-fe/
├── libs/
│   ├── ui/          # @shared-ui
│   ├── types/       # @shared-types — DTOs shared with FE
│   └── utils/       # @shared-utils — upi-parser, currency, dates
├── docs/architecture/
└── package.json
```

Prisma schema path: `apps/rupeelens-be/prisma/schema.prisma`.

Nx targets (from repo root):

```bash
pnpm exec nx run rupeelens-be:db-generate
pnpm exec nx run rupeelens-be:db-migrate
pnpm exec nx run rupeelens-be:db-studio
```

## 2.2 Nest module graph (planned)

```text
AppModule
├── ConfigModule (global)     # .env, DATABASE_URL, Setu secrets
├── PrismaModule (global)
├── HealthModule
├── ConsentModule
├── WebhookModule
├── TransactionsModule
├── AccountsModule
└── IngestionModule           # parse Setu JSON, UPI regex, upsert
```

## 2.3 Module responsibilities

| Module | Responsibility |
| ------ | -------------- |
| **ConfigModule** | Validate env: `DATABASE_URL`, `SETU_*`, `JWT_SECRET` |
| **PrismaModule** | `PrismaClient` connect/disconnect |
| **ConsentModule** | `POST /api/consents`, `GET /api/consents/:id` |
| **WebhookModule** | HMAC verify, log delivery, dispatch events |
| **IngestionModule** | Fetch handler → parse → `upsert` accounts/transactions |
| **TransactionsModule** | `GET /api/transactions` scoped by `userId` |
| **AccountsModule** | `GET /api/accounts` |
| **HealthModule** | `GET /api/health` (`SELECT 1`) |

## 2.4 IngestionService (planned behavior)

- Loop Setu `accounts[]` → upsert `BankAccount`.
- Loop `transactions[]` → `parseNarration()` → `transaction.upsert` on `@@unique([accountId, externalId])`.
- On `P2002`, count as skipped (idempotent retry).
- Keep `rawNarration` when regex parse fails.

UPI parse examples:

| Raw narration | Parsed |
| ------------- | ------ |
| `UPI/swiggy@ybl/...` | merchant: Swiggy, category: FOOD |
| `UPI/9876543210@...` | Transfer to masked mobile |

Full reference implementation sketch lives in Eraser doc section 3.2.2; implement in `apps/rupeelens-be/src/ingestion/` when wiring Setu.
