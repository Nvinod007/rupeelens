# Rupeelens

**Track. Analyze. Plan.**

Self-hosted personal finance dashboard that aggregates UPI, IMPS, NEFT, and net-banking transactions from multiple Indian bank accounts into one unified ledger and analytics UI.

---

## What it does (product vision)

Rupeelens is a **personal multi-bank UPI & transaction aggregator** (not a generic expense app):

| Area | Planned capability |
|------|-------------------|
| **Data pipeline** | Setu Account Aggregator (AA) — consent flow, webhooks (`FINANCIAL_DATA_READY`), secure fetch of financial data |
| **ETL** | Parse AA JSON, normalize balances/transactions, deconstruct UPI narration strings, idempotent upserts |
| **Dashboard** | Unified ledger, multi-account filters, search across merchants and references |
| **Ops** | Async workers for webhooks, encrypted storage, webhook signature validation |

High-level flow:

```text
Next.js (rupeelens-fe)  ←→  API (planned)  ←→  Setu AA
                                    ↓
                              PostgreSQL
```

---

## Repository status

This repo is an **[Nx](https://nx.dev) monorepo** (pnpm). What exists today vs what’s planned:

| Piece | Status |
|-------|--------|
| `apps/rupeelens-fe` | Next.js app (App Router) |
| `libs/ui` (`@shared-ui`) | Shared UI — Tailwind theme, shadcn/ui components |
| `apps/rupeelens-fe-e2e` | Playwright e2e |
| `apps/rupeelens-be` (Nest) | Started (config, serve on :3001) |
| Nest API + PostgreSQL + Setu integration | **Planned** — see [docs/architecture](./docs/architecture/) |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Monorepo | Nx 22, pnpm |
| Frontend | Next.js, React, Tailwind CSS, shadcn/ui (`@shared-ui`) |
| Backend (planned) | NestJS (or Node API), PostgreSQL |
| Integrations (planned) | Setu Account Aggregator |
| Quality | ESLint (flat config), Prettier, Jest, Playwright |
| CI | GitHub Actions — affected lint/test; affected build on PR; gated build on `main` |

---

## Project structure

```text
rupeelens/
├── apps/
│   ├── rupeelens-fe/          # Next.js dashboard
│   └── rupeelens-fe-e2e/      # Playwright tests
├── libs/
│   └── ui/                    # @shared-ui — shared components & theme
├── docs/
│   ├── architecture/          # HLD, LLD, ERD, API, flows (see README there)
│   ├── learnings/             # Tutorials (Prisma, Setu, …)
│   └── shared-ui/             # How to add shadcn components to the lib
├── .github/workflows/
│   ├── ci.yml                 # PR + main CI
│   └── build-manual.yml       # Manual affected build (approval)
├── components.json            # shadcn CLI (root; targets libs/ui)
├── eslint.config.mjs
├── package.json               # Root scripts only
└── tsconfig.base.json         # Path alias @shared-ui
```

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.x (see `packageManager` in root `package.json`)

---

## Getting started

```sh
git clone <your-repo-url>
cd rupeelens
pnpm install
```

### Run the frontend locally

```sh
pnpm exec nx dev rupeelens-fe
```

Open [http://localhost:3000](http://localhost:3000).

### Other useful commands

```sh
# Lint / test / build (all projects)
pnpm lint
pnpm test
pnpm build

# Only what changed vs main
pnpm lint:affected
pnpm test:affected
pnpm build:affected

# Format
pnpm format
pnpm format:check

# E2E
pnpm exec nx e2e rupeelens-fe-e2e

# Dependency graph
pnpm exec nx graph
```

Import shared UI in the app:

```tsx
import { Button } from "@shared-ui";
```

See [docs/shared-ui/README.md](./docs/shared-ui/README.md) and [adding components](./docs/shared-ui/adding-components.md).

---

## Environment variables

Backend and Setu credentials are **not wired yet**. When the API is added, use a root or app-level `.env` (never commit secrets). Typical keys will include:

- Setu / AA client credentials
- Webhook signing secret
- `DATABASE_URL` (PostgreSQL)

---

## CI/CD

Workflow: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

| Job | When | What |
|-----|------|------|
| **verify** | Every PR and push to `main` | `nx affected` — lint & test |
| **build-pr** | Pull requests | `nx affected` — build (compile only; no deploy) |
| **build-main** | Push to `main` | `nx affected` — build after **manual approval** |

**One-time setup:** In GitHub → **Settings → Environments**, create `build-approval` and add required reviewers.

Manual build: **Actions → Build (manual) → Run workflow** ([`build-manual.yml`](./.github/workflows/build-manual.yml)).

`nx affected` uses full git history (`fetch-depth: 0`) and [`nrwl/nx-set-shas`](https://github.com/nrwl/nx-set-shas) so only changed projects are checked.

---

## Roadmap (from SRS)

1. **API** — Nest app in `apps/`, webhook route `/webhooks/setu-aa`, worker queue for ETL  
2. **Database** — PostgreSQL schema (accounts, transactions, `raw_narration` fallback)  
3. **Setu AA** — Consent init, redirect/SDK, webhook + fetch pipeline  
4. **Dashboard** — Ledger, filters, search, charts  
5. **Deploy** — Separate workflow with `production` environment (deploy ≠ `nx build`)

---

## Contributing

1. Branch from `main`
2. Keep changes focused; use `pnpm lint:affected` / `pnpm test:affected` before pushing
3. Open a PR — CI runs verify + build-pr automatically

---

## License

MIT — see [package.json](./package.json).
