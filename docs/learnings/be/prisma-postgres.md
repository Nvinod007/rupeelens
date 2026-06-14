# Learn PostgreSQL + Prisma for Rupeelens

You will wire this **yourself** in `apps/rupeelens-be`. This guide is your textbook. When done, ask for a review — paste errors or open a PR.

---

## What you are learning (5 minutes)

| Word | Meaning |
|------|---------|
| **PostgreSQL** | Database server — stores rows in tables |
| **Prisma** | TypeScript tool: you describe tables in `schema.prisma`, it generates a client to read/write |
| **Migration** | SQL script that creates/updates tables safely over time |
| **DATABASE_URL** | Connection string in `.env` — password hidden in one line |

**Flow:**

```text
Nest (rupeelens-be)  →  Prisma Client  →  PostgreSQL (Docker)
```

---

## Videos (watch in this order)

### 1) Big picture — Postgres (optional, 15 min)

- Search YouTube: **"PostgreSQL tutorial for beginners"** (any recent 2024+ with good ratings)
- You only need: database, table, row, column, primary key, foreign key

### 2) Prisma overview (short)

- **Prisma in 100 Seconds** — search YouTube: `Fireship prisma`
- Official: [Prisma YouTube channel](https://www.youtube.com/@PrismaData) — playlist *Getting started*

### 3) Prisma + TypeScript + Postgres (main tutorial)

- Official docs (interactive, best source):  
  [Start from scratch — TypeScript + PostgreSQL](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)

Do **Parts 1–4** (init, schema, migrate, query). Skip their sample app structure — use **our paths** below instead.

### 4) Prisma + NestJS (when wiring API)

- Official Nest recipe: [NestJS + Prisma](https://docs.nestjs.com/recipes/prisma)
- YouTube search: `NestJS Prisma tutorial` (pick one < 60 min, recent)

---

## Blogs / docs (bookmark these)

| Resource | URL | Use for |
|----------|-----|---------|
| Prisma docs home | https://www.prisma.io/docs | Everything |
| Schema reference | https://www.prisma.io/docs/orm/reference/prisma-schema-reference | Field types, relations |
| Migrate | https://www.prisma.io/docs/orm/prisma-migrate | `db:migrate` |
| Prisma Studio | https://www.prisma.io/docs/orm/tools/prisma-studio | View data in browser |
| Nest + Prisma | https://docs.nestjs.com/recipes/prisma | `PrismaService` |
| Postgres Docker image | https://hub.docker.com/_/postgres | `docker-compose` |

---

## Rupeelens-specific paths (do not use Prisma’s default folder names)

| Prisma tutorial says | You use |
|----------------------|---------|
| `prisma/schema.prisma` in random folder | `apps/rupeelens-be/prisma/schema.prisma` |
| `.env` in same folder | Repo root `.env` with `DATABASE_URL` |
| `npx prisma` | `pnpm exec prisma --schema=apps/rupeelens-be/prisma/schema.prisma` |

---

## Hands-on checklist (your project)

Check each box yourself. Stop if a step fails and fix before continuing.

### Phase A — Postgres running

- [ ] Create `docker-compose.yml` at repo root (Postgres 16, user/db/password `rupeelens`)
- [ ] Run `docker compose up -d`
- [ ] In `.env`, set:
  ```env
  DATABASE_URL=postgresql://rupeelens:rupeelens@localhost:5432/rupeelens
  ```
- [ ] Test with GUI (optional): [TablePlus](https://tableplus.com/) or `pnpm exec prisma studio` later

### Phase B — Install Prisma

From repo root:

```bash
pnpm add @prisma/client
pnpm add -D prisma@6
```

Use **Prisma 6** if `prisma@7` complains about Node version. Match Node to `.nvmrc` (20+).

**Init (only once):** run inside the backend app so files land in the right place:

```bash
cd apps/rupeelens-be
pnpm exec prisma init --datasource-provider postgresql
```

That creates `apps/rupeelens-be/prisma/schema.prisma`. Put `DATABASE_URL` in `apps/rupeelens-be/.env` (not repo root).

Nx targets (already in `apps/rupeelens-be/project.json`):

```bash
pnpm exec nx run rupeelens-be:db-generate
pnpm exec nx run rupeelens-be:db-migrate
pnpm exec nx run rupeelens-be:db-studio
```

### Phase C — First schema (Rupeelens tables)

Create `apps/rupeelens-be/prisma/schema.prisma`:

**Starter models** (expand later for Setu):

- `User` — `id`, `name?`, `mobile?`, timestamps
- `Consent` — link to user, `setuConsentId`, `status` enum
- `BankAccount` — link to user + consent, bank name, masked number
- `Transaction` — link to account, amount, direction, narration, `bookedAt`
- Unique: `@@unique([accountId, externalId])` on Transaction (idempotent upserts)

Align `Transaction` shape with `libs/types` when you export API DTOs.

Run:

```bash
pnpm db:migrate
# Name migration: init
pnpm db:generate
```

- [ ] Migration folder appears under `apps/rupeelens-be/prisma/migrations/`
- [ ] `pnpm db:studio` shows empty tables

### Phase D — Use Prisma in Nest (you wire)

Follow [NestJS Prisma recipe](https://docs.nestjs.com/recipes/prisma):

1. `apps/rupeelens-be/src/prisma/prisma.service.ts` — extends `PrismaClient`, `$connect` on init
2. `prisma.module.ts` — global module
3. Import `PrismaModule` in `app.module.ts`
4. `GET /api/health` — `await prisma.$queryRaw\`SELECT 1\`` 
5. `GET /api/transactions` — `prisma.transaction.findMany(...)` (seed 2 rows manually in Studio first)

- [ ] `pnpm exec nx serve rupeelens-be` — health OK
- [ ] curl returns transaction JSON

### Phase E — Seed data (practice)

Create `apps/rupeelens-be/prisma/seed.ts` (optional) or insert rows in Prisma Studio.

Practice:

- `create`, `findMany`, `upsert`
- `orderBy: { bookedAt: 'desc' }`

---

## Mental model for Setu (later)

Do **not** store raw Setu JSON as your only data. Plan:

```text
Setu JSON  →  parse in Nest  →  save User / Account / Transaction rows
```

Keep optional `rawNarration` column for lines that fail regex parse (from your SRS).

Design doc (you write): `docs/learnings/be/setu-field-map.md` — Setu field → your column.

---

## Common mistakes

| Problem | Fix |
|---------|-----|
| `Can't reach database` | `docker compose ps` — is Postgres up? |
| Wrong password in URL | Match `docker-compose` env vars |
| Prisma Client not generated | Run `pnpm db:generate` after schema change |
| Nest can't find `@prisma/client` | Generate after migrate; restart `nx serve` |
| Port 5432 in use | Another Postgres running — change host port in compose |
| `.env` not loaded | `ConfigModule` in `app.module.ts` with `envFilePath: ['../../.env']` |

---

## When you want a review

Send:

1. `apps/rupeelens-be/prisma/schema.prisma`
2. List of endpoints you added
3. Screenshot or output of `curl http://localhost:3001/api/health` and `/api/transactions`
4. Any error from `pnpm db:migrate` or `nx serve rupeelens-be`

Say: **"Review my Prisma wiring"** — we check schema, relations, and Nest structure only (not full Setu yet).

---

## Suggested learning time

| Day | Focus |
|-----|--------|
| 1 | Docker Postgres + Prisma init + first migrate |
| 2 | Prisma Studio + seed data + `findMany` |
| 3 | Nest `PrismaService` + health + transactions endpoint |
| 4 | Sketch Setu field map (no API keys yet) |

After that you are ready for **mock Setu** → real Setu sandbox.
