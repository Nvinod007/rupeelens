# @shared-ui — Design system (shadcn + Nx)

Rupeelens uses a **source-based** UI kit: [shadcn/ui](https://ui.shadcn.com) components live in `libs/ui` and apps import them via `@shared-ui`.

This is **not** an npm package like MUI. The CLI copies component source into the repo; we own and customize the files.

## Architecture

```
rupeelens/
├── components.json          # shadcn CLI config (repo root)
├── tsconfig.json            # required by shadcn CLI
├── tsconfig.base.json       # @shared-ui path aliases
├── libs/ui/                 # shared UI library (Nx project: ui)
│   └── src/
│       ├── index.ts         # root barrel → components + lib
│       ├── lib/
│       │   ├── index.ts     # barrel (cn, …)
│       │   └── utils.ts
│       └── components/
│           ├── index.ts     # barrel → ui/*
│           └── ui/
│               ├── index.ts # barrel per shadcn primitive folder
│               └── button.tsx
└── apps/rupeelens-fe/       # Next.js app
    ├── tailwind.config.js   # uses libs/ui/tailwind.preset.js
    └── src/app/global.css   # @tailwind + imports shared theme
libs/ui/
    ├── tailwind.preset.js   # shared Tailwind theme (colors, radius, animate)
    └── src/styles/theme.css # shared CSS variables (light/dark)
```

## Path aliases

| Alias                      | Resolves to                 | Purpose                                            |
| -------------------------- | --------------------------- | -------------------------------------------------- |
| `@shared-ui`               | `libs/ui/src/index.ts`      | App imports: `import { Button } from '@shared-ui'` |
| `@shared-ui/lib`           | `libs/ui/src/lib`           | Inside lib: `import { cn } from '@shared-ui/lib'`  |
| `@shared-ui/components/ui` | `libs/ui/src/components/ui` | Inside lib: cross-component imports                |
| `@shared-ui/*`             | `libs/ui/src/*`             | Fallback (e.g. shadcn `@shared-ui/lib/utils`)      |

## Folder roles

| Path              | Role                                                          |
| ----------------- | ------------------------------------------------------------- |
| `lib/utils.ts`    | `cn()` — merges Tailwind classes (`clsx` + `tailwind-merge`)  |
| `components/ui/*` | shadcn primitives from the registry                           |
| `**/index.ts`     | Barrel exports — add each new file to its folder’s `index.ts` |

## Rules for apps

- **Do** import UI from `@shared-ui`
- **Do not** import from `@shared-ui/components/ui/button` in app code (keeps one public API)
- **Do not** run `shadcn init --cwd apps/rupeelens-fe` — it tries to scaffold a new Next app

## Commands

Use **pnpm** from the **repo root**:

```bash
# Add a shadcn component (writes into libs/ui)
pnpm dlx shadcn@latest add button

# Add multiple
pnpm dlx shadcn@latest add card dialog input

# Run the Next app
pnpm exec nx dev rupeelens-fe
```

See [adding-components.md](./adding-components.md) for the full checklist after each add.

## Initial setup (already done)

1. Nx lib: `libs/ui` with import path `@shared-ui`
2. Root `components.json` pointing aliases at `@shared-ui/...`
3. `tsconfig.base.json` paths: `@shared-ui` + `@shared-ui/*`
4. Root `tsconfig.json` (extends base — required by shadcn CLI)
5. Tailwind in `apps/rupeelens-fe` includes lib via `createGlobPatternsForDependencies`
6. Root deps: `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate`

## Optional: animated icons

Skip `lucide-react` if using [AnimateIcons](https://animateicons.in). Add registry URLs when needed:

```bash
pnpm dlx shadcn@latest add https://animateicons.in/r/lu-circle-plus.json
```

## Further reading

- [Adding components](./adding-components.md)
- [shadcn docs](https://ui.shadcn.com/docs)
- [Nx + Next tailwind](https://nx.dev/nx-api/next/documents/application#tailwind-configuration)
