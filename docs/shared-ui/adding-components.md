# Adding shadcn components to @shared-ui

## Quick steps

1. From **repo root**, run:

   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```

   Examples:

   ```bash
   pnpm dlx shadcn@latest add card
   pnpm dlx shadcn@latest add dialog dropdown-menu
   ```

2. Confirm files were created under `libs/ui/src/`:
   - `components/ui/<name>.tsx`
   - `lib/utils.ts` (first add only, if missing)

3. Export from the UI barrel — edit `libs/ui/src/components/ui/index.ts`:

   ```ts
   export { Button, buttonVariants, type ButtonProps } from "./button";
   export { Card, CardHeader, CardTitle } from "./card";
   ```

   Root `libs/ui/src/index.ts` re-exports `./components` and `./lib` — no change per component.

4. Install any **new** Radix/primitive deps the CLI prints (at repo root):

   ```bash
   pnpm add @radix-ui/react-dialog
   ```

5. Use in an app (`apps/rupeelens-fe`):

   ```tsx
   import { Button } from "@shared-ui";

   export default function Page() {
     return <Button variant="default">Click me</Button>;
   }
   ```

6. If styles look wrong, check `libs/ui/src/styles/theme.css` and that the app imports it from `global.css` (see [Theme CSS](#theme-css) below).

---

## What the CLI does

| `components.json` alias           | Files go to                       |
| --------------------------------- | --------------------------------- |
| `utils` → `@shared-ui/lib/utils`  | `libs/ui/src/lib/utils.ts`        |
| `ui` → `@shared-ui/components/ui` | `libs/ui/src/components/ui/*.tsx` |

Inside `libs/ui`, prefer **alias barrels** (not relative paths):

```ts
import { cn } from "@shared-ui/lib";
import { Button } from "@shared-ui/components/ui";
```

shadcn CLI may still write `@shared-ui/lib/utils` — that is fine. Apps should use `@shared-ui` only.

---

## Optional: thin wrapper file

If you want a stable export name separate from shadcn’s file:

`libs/ui/src/components/button.ts`:

```ts
export { Button, buttonVariants } from "./ui/button";
```

`libs/ui/src/index.ts`:

```ts
export * from "./components/button";
```

Not required — exporting from `./components/ui/button` is fine.

---

## Internal imports

Inside `libs/ui`, use alias barrels:

| Import                     | Resolves to                  |
| -------------------------- | ---------------------------- |
| `@shared-ui/lib`           | `src/lib/index.ts` (`cn`, …) |
| `@shared-ui/components/ui` | `src/components/ui/index.ts` |

Avoid `../../` relative paths. `libs/ui/eslint.config.mjs` allows `@shared-ui/*` inside this lib (Nx normally requires relative imports within a project). Manual edits can be overwritten if you re-run `shadcn add` for the same component.

---

## Theme CSS

Theme tokens live in **`libs/ui/src/styles/theme.css`** (CSS variables). Tailwind mapping lives in **`libs/ui/tailwind.preset.js`**.

Each Next app only needs:

```css
/* apps/<app>/src/app/global.css — import tokens first, then Tailwind */
@import "../../../../libs/ui/src/styles/theme.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js
// apps/<app>/tailwind.config.js
const sharedUiPreset = require('../../libs/ui/tailwind.preset');
module.exports = {
  presets: [sharedUiPreset],
  content: [/* app paths + ../../libs/ui/src/**/* */],
};
```

`components.json` points `tailwind.css` at `libs/ui/src/styles/theme.css` so `shadcn add` updates the shared file.

---

## Troubleshooting

| Error                              | Fix                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `Couldn't find tsconfig.json`      | Ensure root `tsconfig.json` exists (extends `tsconfig.base.json`)                             |
| `ERR_PNPM_ADDING_TO_ROOT`          | Install deps from root: `pnpm add <pkg>` (no nested app `package.json`)                       |
| `dest already exists` on init      | Do **not** use `shadcn init` in the app; use root `components.json` + `add` only              |
| Classes not applied                | Add `../../libs/ui/src/**/*.{ts,tsx}` to Tailwind `content` if not using Nx helper with turbo |
| Cannot find `@shared-ui/lib/utils` | Create `libs/ui/src/lib/utils.ts` or re-run `shadcn add button`                               |

---

## Do not

- Run `pnpm dlx shadcn@latest init --cwd apps/rupeelens-fe` (creates a nested Next app)
- Import shadcn files directly from apps — use `@shared-ui`
- Commit duplicate `components.json` inside `libs/ui` unless you intentionally maintain two configs
