# @shared-ui (`libs/ui`)

Shared React UI library for Rupeelens (shadcn/ui + Tailwind).

**Theme:** `src/styles/theme.css` (tokens) · `tailwind.preset.js` (Tailwind colors + base styles)

**Documentation:** [docs/shared-ui/README.md](../../docs/shared-ui/README.md)

**Add a component:**

```bash
# from repo root
pnpm dlx shadcn@latest add <name>
```

Then export it from `src/components/ui/index.ts` (barrels roll up to `@shared-ui`). Details: [docs/shared-ui/adding-components.md](../../docs/shared-ui/adding-components.md).
