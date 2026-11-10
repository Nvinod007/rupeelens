-- Repair booked_at if you already ran bulk-transactions-once.sql with negative intervals.
-- Those rows were stored in the future (now + N days), so home "All time" spend ignored them.
--
-- Mirrors each future booked_at around now(): future → same distance in the past.
update public.transactions
set booked_at = now() - (booked_at - now())
where deleted_at is null
  and booked_at > now();
