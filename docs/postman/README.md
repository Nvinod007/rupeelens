# RupeeLens Postman (Collection v3)

Postman **Local Mode** uses multi-file YAML under `postman/`, not JSON.

## Layout

```
docs/postman/
  .postman/resources.yaml          # Point Postman Local View here (repo path = docs/postman)
  postman/
    collections/rupeelens-api/       # Collection v3 folder
    environments/*.environment.yaml
```

## Setup in Postman

1. **Local View** → set repo directory to **`docs/postman`** (this folder).
2. Open workspace; collection **RupeeLens API** and environments load from YAML.
3. Select **RupeeLens — Local** (or Production).

If Postman still shows old JSON, delete the JSON files (removed from git) and use **Upgrade to v3** or re-link `resources.yaml`.

## Environment variables

| Variable | Source |
|----------|--------|
| `apiBaseUrl` | Local or prod API base |
| `supabaseUrl` / `supabaseAnonKey` | `apps/rupeelens-fe/.env.example` |
| `accessToken` / `refreshToken` | After web Google login (see below) |
| `geminiApiKey` | For BYOK + parse |

## Login

Google OAuth is not in Postman. Copy `access_token` from the browser after signing in, or run **Auth Supabase → Refresh access token** with `refreshToken` set.

## Smoke

Run folder **Smoke flow** with `accessToken` set.

## CLI (optional)

```bash
postman collection lint postman/collections/rupeelens-api
postman collection run postman/collections/rupeelens-api -e postman/environments/rupeelens-local.environment.yaml
```

Newman does **not** run v3; use Postman CLI.
