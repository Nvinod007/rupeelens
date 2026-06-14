# @auth

Shared Supabase auth helpers for Rupeelens FE and BE.

## Exports

| Path | Use |
| ---- | --- |
| `createSupabaseBrowserClient` | Next.js client components |
| `createSupabaseServerClient` | Next.js server (`@auth/server`) |
| `createSupabaseMiddlewareClient` | Next.js middleware |
| `signInWithGoogle` / `signOut` | OAuth flows |
| `verifySupabaseAccessToken` | Nest (via `SupabaseAuthService`) — validate JWT |
| `fetchWithAuth` | FE API calls to Nest with Bearer token |

## Types

`SupabaseAuthClaims` lives in `@shared-types` (used by FE/BE).

## Env

- **FE:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
- **BE:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (same Supabase project)
