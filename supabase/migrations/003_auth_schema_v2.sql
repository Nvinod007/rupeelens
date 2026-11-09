-- 003: Google auth + user-scoped data.
-- CLEAN START: device-scoped rows from 001/002 are discarded (pre-launch).
-- Run in the Supabase SQL editor after enabling the Google provider.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (public mirror of auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users that signed in before this migration.
insert into public.profiles (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- user_settings: replaces byok_keys (ciphertext only, encrypted by the API)
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  byok_encrypted text,
  updated_at timestamptz not null default now()
);

drop table if exists public.byok_keys;

-- ---------------------------------------------------------------------------
-- transactions: device_id -> user_id, soft delete
-- ---------------------------------------------------------------------------
delete from public.transactions;

drop index if exists public.transactions_device_booked_idx;
alter table public.transactions drop column if exists device_id;
alter table public.transactions
  add column if not exists user_id uuid not null references auth.users (id) on delete cascade,
  add column if not exists deleted_at timestamptz;

create index if not exists transactions_user_booked_idx
  on public.transactions (user_id, booked_at desc)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Row-level security (defence in depth; the API uses the service role)
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "transactions_own" on public.transactions;
create policy "transactions_own" on public.transactions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- user_settings holds ciphertext: no client policy => only the API can touch it.
