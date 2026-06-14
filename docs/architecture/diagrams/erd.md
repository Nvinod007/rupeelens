# ERD

**View in Eraser (flowchart UI):** [Open diagram](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=0jqWkaQXvCZ1M4hbdt5L&layout=canvas)

```eraser
title Rupeelens Personal Finance Aggregator

User [icon: user, color: blue] {
  id string pk
  name string
  mobile string
  email string
  createdAt timestamp
  updatedAt timestamp
}

Consent [icon: check-circle, color: green] {
  id string pk
  userId string fk
  setuConsentId string unique
  status enum
  createdAt timestamp
  updatedAt timestamp
}

BankAccount [icon: credit-card, color: purple] {
  id string pk
  userId string fk
  consentId string fk
  setuAccountId string
  bankName string
  maskedAccountNumber string
  currency string
  isActive boolean
}

Transaction [icon: dollar-sign, color: orange] {
  id string pk
  accountId string fk
  externalId string
  amount decimal
  direction enum
  narration string
  rawNarration string
  merchantName string
  bookedAt timestamp
}

User.id < Consent.userId
User.id < BankAccount.userId
Consent.id < BankAccount.consentId
BankAccount.id < Transaction.accountId
```
