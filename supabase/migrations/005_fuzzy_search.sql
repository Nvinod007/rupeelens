-- 005: typo-tolerant transaction search (pg_trgm). Run in the Supabase SQL editor.

create extension if not exists pg_trgm;

create index if not exists transactions_title_trgm_idx
  on public.transactions using gin (title gin_trgm_ops)
  where deleted_at is null;

create or replace function public.search_transactions_fuzzy(
  p_user uuid,
  p_q text,
  p_limit int,
  p_status text default null,
  p_category text default null
)
returns setof public.transactions
language sql
stable
as $$
  select t.*
  from public.transactions t
  where t.user_id = p_user
    and t.deleted_at is null
    and (p_status is null or t.status = p_status)
    and (p_category is null or t.category = p_category)
    and greatest(
      word_similarity(p_q, t.title),
      word_similarity(p_q, coalesce(t.notes, ''))
    ) > 0.25
  order by
    greatest(
      word_similarity(p_q, t.title),
      word_similarity(p_q, coalesce(t.notes, ''))
    ) desc,
    t.booked_at desc
  limit p_limit;
$$;

-- Only the API (service role) may call it; it takes a user id as a parameter.
revoke all on function public.search_transactions_fuzzy(uuid, text, int, text, text)
  from public, anon, authenticated;
