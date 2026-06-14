# ETL flowchart

**View in Eraser (flowchart UI):** [Open diagram](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=SvriT_StUjgcu2Tvn4aw&layout=canvas)

```eraser
title Rupeelens ETL Pipeline

direction down

Webhook Received [shape: oval, color: blue]
Validate HMAC [shape: diamond, color: yellow]
Invalid Signature [shape: oval, color: red]
Log WebhookDelivery [shape: rectangle]
Find Consent [shape: rectangle]
Fetch Setu Data [shape: rectangle, icon: globe]
For Each Account [shape: rectangle]
Upsert BankAccount [shape: rectangle]
For Each Transaction [shape: rectangle]
Parse UPI Narration [shape: diamond, color: yellow]
Upsert Transaction [shape: rectangle]
Duplicate Skip [shape: rectangle, color: gray]
Ledger Ready [shape: oval, color: green]

Webhook Received > Validate HMAC
Validate HMAC > Invalid Signature: No
Validate HMAC > Log WebhookDelivery: Yes
Log WebhookDelivery > Find Consent
Find Consent > Fetch Setu Data
Fetch Setu Data > For Each Account
For Each Account > Upsert BankAccount
Upsert BankAccount > For Each Transaction
For Each Transaction > Parse UPI Narration
Parse UPI Narration > Upsert Transaction: Parsed
Parse UPI Narration > Upsert Transaction: Use rawNarration
Upsert Transaction > Duplicate Skip: P2002 unique violation
Upsert Transaction > For Each Transaction: Next txn
Duplicate Skip > For Each Transaction
For Each Transaction > Ledger Ready: Done
```
