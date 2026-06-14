# 3. Database schema

Visual ERD: [Eraser](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=0jqWkaQXvCZ1M4hbdt5L) · [source](./diagrams/erd.md)

## 3.1 Relationships

```text
User 1──* Consent
User 1──* BankAccount
Consent 1──* BankAccount
BankAccount 1──* Transaction

WebhookDelivery (optional audit log, no FK to User)
```

## 3.2 Tables

### User

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | String PK (cuid) | |
| `name` | String? | |
| `mobile` | String? unique | |
| `email` | String? unique | |
| `createdAt` / `updatedAt` | DateTime | |

### Consent

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | String PK | |
| `userId` | FK → User | |
| `setuConsentId` | String unique | Setu handle |
| `status` | Enum | PENDING, ACTIVE, REVOKED, EXPIRED |
| `redirectUrl` | String? | |
| `createdAt` / `updatedAt` | DateTime | |

### BankAccount

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | String PK | |
| `userId` | FK → User | |
| `consentId` | FK → Consent | |
| `setuAccountId` | String | indexed |
| `bankName` | String | |
| `accountType` | String? | SAVINGS, CURRENT, … |
| `maskedAccountNumber` | String | e.g. XXXX1234 |
| `currency` | String | default INR |
| `isActive` | Boolean | default true |
| `createdAt` | DateTime | |

### Transaction

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | String PK | |
| `accountId` | FK → BankAccount | |
| `externalId` | String | Setu txn id |
| `amount` | Decimal(12,2) | |
| `direction` | CREDIT \| DEBIT | |
| `narration` | String | cleaned label |
| `rawNarration` | String? | original if parse fails |
| `merchantName` | String? | |
| `category` | String? | |
| `bookedAt` | DateTime | |
| `valueDate` | DateTime? | |
| `createdAt` | DateTime | |

**Unique:** `@@unique([accountId, externalId])` — idempotent upserts.

### WebhookDelivery (optional)

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | String PK | |
| `eventType` | String | |
| `payload` | Json | |
| `signatureValid` | Boolean | |
| `processedAt` | DateTime? | |
| `error` | String? | |
| `createdAt` | DateTime | |

## 3.3 Prisma schema (reference)

Target file: `apps/rupeelens-be/prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String?
  mobile    String?  @unique
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  consents     Consent[]
  bankAccounts BankAccount[]

  @@map("users")
}

enum ConsentStatus {
  PENDING
  ACTIVE
  REVOKED
  EXPIRED
}

model Consent {
  id            String        @id @default(cuid())
  userId        String
  setuConsentId String        @unique
  status        ConsentStatus @default(PENDING)
  redirectUrl   String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  bankAccounts BankAccount[]

  @@index([userId])
  @@map("consents")
}

model BankAccount {
  id                  String   @id @default(cuid())
  userId              String
  consentId           String
  setuAccountId       String
  bankName            String
  accountType         String?
  maskedAccountNumber String
  currency            String   @default("INR")
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  consent      Consent       @relation(fields: [consentId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@index([consentId])
  @@index([setuAccountId])
  @@map("bank_accounts")
}

enum TransactionDirection {
  CREDIT
  DEBIT
}

model Transaction {
  id           String               @id @default(cuid())
  accountId    String
  externalId   String
  amount       Decimal              @db.Decimal(12, 2)
  direction    TransactionDirection
  narration    String
  rawNarration String?
  merchantName String?
  category     String?
  bookedAt     DateTime
  valueDate    DateTime?
  createdAt    DateTime             @default(now())

  account BankAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@unique([accountId, externalId])
  @@index([accountId, bookedAt])
  @@index([merchantName])
  @@index([category])
  @@map("transactions")
}

model WebhookDelivery {
  id             String    @id @default(cuid())
  eventType      String
  payload        Json
  signatureValid Boolean
  processedAt    DateTime?
  error          String?
  createdAt      DateTime  @default(now())

  @@index([eventType])
  @@index([createdAt])
  @@map("webhook_deliveries")
}
```
