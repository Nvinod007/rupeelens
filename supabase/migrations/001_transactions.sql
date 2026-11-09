-- Run in Supabase SQL editor (or via CLI) before relying on persistence.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  title text not null,
  amount numeric not null default 0,
  category text,
  booked_at timestamptz not null default now(),
  notes text,
  transcript text,
  status text not null check (status in ('draft', 'saved')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_device_booked_idx
  on public.transactions (device_id, booked_at desc);

alter table public.transactions enable row level security;
