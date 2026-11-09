# RupeeLens — agent briefing

**URL:** https://rupeelens.appkits.in · **SRS:** `rupeelens-srs.html` (visual, diagram-first)

## Product
- Web/PWA: log **personal transactions** when rushed — **three intake modes** (same home FAB / add sheet):
  1. **Voice** — mic + browser STT → transcript → **Save · Draft · Cancel** → LLM on Save path → review card.
  2. **Prompt** — single natural-language text box (no mic), e.g. “paid 500 for Swiggy biryani this morning” → same **Save · Draft · Cancel** + LLM as voice.
  3. **Manual (table)** — Splitwise-style field grid (amount, title, date, category, notes); **no LLM on save**; lands **refined** (`saved`) after confirm; optional “save as draft” without AI.
- **Mic denied / blocked:** primary FAB shows **red mic**; tooltip **“Enable microphone in browser settings”**; tap opens **help sheet** (cannot deep-link OS settings on all platforms — Chrome: lock icon → Site settings → Microphone; iOS: Settings → Safari → Microphone).
- **Voice / prompt disposition (3-way):** after capture → **Save** (review before saving) · **Draft** (badge, refine later) · **Cancel** (discard). Never auto-post.
- **Splits:** Splitwise-style contacts, groups, balances (post-MVP).
- **BYOK LLM** default; optional tiny host pool later (not v1 focus).

## Stack
| Layer | Choice |
|-------|--------|
| Repo | **Nx** monorepo — `apps/rupeelens-fe` + `apps/rupeelens-api` |
| FE | **Next.js** (App Router) · **Tailwind CSS** · **ESLint** + **Prettier** · mic + **Web Speech API** · **SSE** client · host **Vercel** |
| BE | **NestJS** on **Fly.io free** (thin Gemini streaming proxy; no local models on 512MB-class VMs) |
| DB | **Supabase** free tier (Postgres + auth helpers as needed) |
| LLM | **Gemini Flash-Lite** (BYOK primary) · **Groq** free backup · **Gemma 3 1B** via **WebLLM** on-device privacy fallback |
| CI/CD | **GitHub Actions** — lint, test, deploy (Vercel FE · Fly BE) |

## BYOK flow
1. Settings → open **https://aistudio.google.com/api-keys** (new tab) → user creates key → paste in app.
2. Backend **encrypt at rest** (`key-vault.service.ts`); **never log** keys; redact auth headers.
3. Validate loosely: **`AIza…`** or **`AQ.…`** prefix (don’t reject newer formats).
4. **No “Test connection” button** — first real voice→draft parse is the test.
5. **No** one-click Google key handoff / `return_url` protocol (manual copy-paste only).

## Free-tier math (Nov 2026 baseline)
- **Flash-Lite:** ~**500 RPD/project** (GCP project, not per user).
- **Groq free:** ~**1000 RPD/org**.
- **Shared host pool:** ~**10–25** light users (e.g. 3–5 parses/user/day); **BYOK** for scale.
- **STT:** browser Web Speech **$0**, no published daily cap; Chrome/Safari; audio may hit **Google/Apple**.

## Consent (must ship; not legal advice)
- Link **Privacy** + **Terms**; **18+** where required.
- Optional checkbox: user is **account holder** of their LLM key and accepts **provider ToS/billing**.
- Disclose: **transcript text** sent to **user-chosen LLM provider** (and host proxy).
- **Mic + Web Speech** disclosure (vendor STT).
- App **not responsible** for provider bills, quotas, or account bans.

## Quick start (build order)
**Monorepo:** root ships `nx.json` + `apps/*/project.json` scaffolds · finish with generators below (NestJS + Supabase only — not Express/Turso)
- `pnpm nx g @nx/next:application rupeelens-fe --directory=apps/rupeelens-fe --appDir=true --style=tailwind --linter=eslint --unitTestRunner=jest --e2eTestRunner=none` (align **ESLint**/**Prettier** with root config)
- `pnpm nx g @nx/nest:application --name=rupeelens-api --directory=apps/rupeelens-api --linter=eslint --unitTestRunner=jest --e2eTestRunner=none` · global prefix `api`

**FE (`apps/rupeelens-fe`):** first files
- `src/app/settings/byok/page.tsx` → `src/app/page.tsx` (minimal tx list) → `src/lib/speech/useWebSpeech.ts` → `src/lib/api/sseParseDraft.ts`
- Vercel: project root = app path; `NEXT_PUBLIC_API_URL` → Fly API

**BE (`apps/rupeelens-api`):** first modules
- `src/parse/parse.controller.ts` + `parse.service.ts` (Gemini **streaming** SSE, Flash-Lite)
- `src/transactions/transactions.controller.ts`
- `src/crypto/key-vault.service.ts` · `@supabase/supabase-js` for persistence
- Fly: `fly launch` / `fly deploy`; CORS `https://rupeelens.appkits.in`

**CI:** `.github/workflows/ci.yml` — `nx affected -t lint test` on PR; deploy workflows for Vercel + Fly on `main`.

## Non-goals v1
Bank sync · multi-currency FX · tax filing · public social feed · AI resale with one master key

## Roadmap (solo + AI assist)
| Phase | Scope | ETA |
|-------|--------|-----|
| **MVP** | Voice drafts, storage, BYOK, consent | **1–2 wk** |
| **Splits** | Contacts, groups, convert, balances | **+2–3 wk** |
| **Polish** | PWA, export, free pool, WebLLM fallback UX | after |

**Default strategy:** BYOK + browser STT → host ~$0 on tokens.
