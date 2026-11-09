-- 004: per-user custom expense categories.
-- Run in the Supabase SQL editor after 003.

create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

-- One category per name per user, ignoring case ("Cooler" == "cooler").
create unique index if not exists user_categories_user_name_idx
  on public.user_categories (user_id, lower(name));

alter table public.user_categories enable row level security;

drop policy if exists "user_categories_own" on public.user_categories;
create policy "user_categories_own" on public.user_categories
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
