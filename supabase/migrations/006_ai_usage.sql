-- 006: per-user daily AI usage (quota). Run in the Supabase SQL editor.

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

-- Only the API (service role) touches this table.
alter table public.ai_usage enable row level security;

-- Atomically consume one unit. Returns the new count, or -1 when the limit is reached.
create or replace function public.consume_ai_quota(
  p_user uuid,
  p_day date,
  p_limit int
)
returns int
language plpgsql
as $$
declare
  used int;
begin
  insert into public.ai_usage as u (user_id, day, count)
  values (p_user, p_day, 1)
  on conflict (user_id, day)
  do update set count = u.count + 1
  where u.count < p_limit
  returning u.count into used;

  return coalesce(used, -1);
end;
$$;

revoke all on function public.consume_ai_quota(uuid, date, int)
  from public, anon, authenticated;
