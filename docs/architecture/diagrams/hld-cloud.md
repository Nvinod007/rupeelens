# HLD (cloud)

**View in Eraser (diagram UI):** [Open diagram](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=UXdwDIDapTBPZYNZZI_d&layout=canvas)

```eraser
title Rupeelens System Architecture

direction right

Client [icon: monitor] {
  Browser [icon: chrome]
}

Frontend [icon: nextjs, color: blue] {
  "rupeelens-fe" [icon: nextjs, label: "Next.js App :3000"]
}

Backend [icon: server, color: green] {
  "rupeelens-be" [icon: nestjs, label: "NestJS API :3001/api"]
  Prisma ORM [icon: prisma]
}

Database [icon: database] {
  PostgreSQL [icon: postgresql, label: "Supabase Postgres"]
}

External Services [icon: cloud] {
  Setu AA [icon: globe, label: "Setu Account Aggregator"]
  Supabase Auth [icon: lock]
}

Future [icon: clock, color: gray] {
  BullMQ Worker [icon: zap, label: "Async ETL Worker"]
}

"CI/CD" [icon: github-actions, color: purple] {
  GitHub Actions [icon: github, label: "Nx affected: lint, test, build"]
}

Monorepo [icon: folder] {
  Nx Workspace [icon: network] {
    ui lib [icon: package, label: "ui"]
    types lib [icon: package, label: "types"]
    utils lib [icon: package, label: "utils"]
  }
}

Browser > "rupeelens-fe": HTTPS
"rupeelens-fe" > "rupeelens-be": REST API
"rupeelens-fe" > Supabase Auth: login
Supabase Auth < "rupeelens-fe": JWT
"rupeelens-fe" > "rupeelens-be": JWT auth
"rupeelens-be" > Prisma ORM
Prisma ORM <> PostgreSQL
"rupeelens-be" > Setu AA: consent & data fetch
Setu AA < "rupeelens-be": POST /api/webhooks/setu [color: orange]
"rupeelens-be" --> BullMQ Worker: queue jobs [color: gray]
BullMQ Worker --> PostgreSQL: ETL writes [color: gray]
GitHub Actions > Nx Workspace: CI pipeline
```
