-- Encrypted BYOK keys per device (ciphertext only; encrypted by the API).
create table if not exists public.byok_keys (
  device_id text primary key,
  encrypted_key text not null,
  updated_at timestamptz not null default now()
);

alter table public.byok_keys enable row level security;
