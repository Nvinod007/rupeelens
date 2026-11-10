-- One-time bulk transactions for local/dev/demo (dashboard + list UI).
-- Run in Supabase Dashboard → SQL → New query (service role; RLS bypassed).
--
-- 1) Set your email below (must exist in auth.users).
-- 2) Run once. Re-running duplicates data unless you delete first (see bottom).
--
-- API alternative: no bulk endpoint — use this SQL or a short script loop on POST /transactions.

with owner as (
  select id as user_id
  from auth.users
  where email = 'vinodkumar.nelanakula@gmail.com'  -- ← change if needed
  limit 1
),
rows as (
  select * from (values
    ('Morning chai', 45, 'Coffee & Snacks', interval '2 days', 'saved', 'Neighbourhood stall'),
    ('Swiggy lunch', 289, 'Food & Dining', interval '2 days', 'saved', null),
    ('Metro card top-up', 500, 'Transport', interval '3 days', 'saved', null),
    ('BigBasket groceries', 1847.50, 'Groceries', interval '4 days', 'saved', 'Weekly stock'),
    ('Netflix', 649, 'Subscriptions', interval '5 days', 'saved', 'Monthly'),
    ('Uber to office', 186, 'Cab & Auto', interval '6 days', 'saved', null),
    ('Petrol', 2500, 'Fuel', interval '7 days', 'saved', 'HP pump'),
    ('Pharmacy', 320, 'Medicines', interval '8 days', 'saved', 'Vitamins'),
    ('Amazon order', 1299, 'Shopping', interval '9 days', 'saved', 'Household'),
    ('Electricity bill', 2150, 'Electricity', interval '10 days', 'saved', 'BESCOM'),
    ('Gym monthly', 1200, 'Fitness', interval '11 days', 'saved', null),
    ('Movie tickets', 780, 'Movies & Events', interval '12 days', 'saved', 'PVR'),
    ('Mobile recharge', 299, 'Mobile & Internet', interval '13 days', 'saved', 'Jio'),
    ('Rent', 22000, 'Rent', interval '14 days', 'saved', 'November'),
    ('School fees', 8500, 'Kids & Family', interval '15 days', 'saved', null),
    ('Restaurant dinner', 2450, 'Food & Dining', interval '16 days', 'saved', 'Birthday'),
    ('Haircut', 350, 'Personal Care', interval '17 days', 'saved', null),
    ('Spotify', 119, 'Subscriptions', interval '18 days', 'saved', null),
    ('Bus pass', 1200, 'Transport', interval '19 days', 'saved', null),
    ('Udemy course', 499, 'Books & Courses', interval '20 days', 'saved', null),
    ('Gift for friend', 1500, 'Gifts & Donations', interval '22 days', 'saved', null),
    ('LIC premium', 5200, 'Insurance', interval '25 days', 'saved', null),
    ('SIP mutual fund', 10000, 'Investments', interval '28 days', 'saved', null),
    ('Home repair', 3200, 'Home & Maintenance', interval '30 days', 'saved', 'Plumber'),
    ('Zomato', 412, 'Food & Dining', interval '32 days', 'saved', null),
    ('Milk & eggs', 280, 'Groceries', interval '33 days', 'saved', null),
    ('Ola auto', 95, 'Cab & Auto', interval '34 days', 'saved', null),
    ('Keyboard', 3499, 'Electronics', interval '35 days', 'saved', null),
    ('Water bill', 450, 'Bills & Utilities', interval '36 days', 'saved', null),
    ('Draft — review me', 0, 'Other', interval '1 day', 'draft', 'Intentional draft for UI'),
    ('Coffee at work', 120, 'Coffee & Snacks', interval '37 days', 'saved', null),
    ('Flight booking', 6850, 'Travel', interval '40 days', 'saved', 'BLR–DEL'),
    ('Hotel stay', 4200, 'Hotels & Stay', interval '41 days', 'saved', '1 night'),
    ('Pet food', 890, 'Pets', interval '42 days', 'saved', null),
    ('Office supplies', 650, 'Business', interval '43 days', 'saved', null),
    ('EMI credit card', 8750, 'EMI & Loans', interval '45 days', 'saved', null),
    ('Income tax advance', 15000, 'Taxes & Fees', interval '50 days', 'saved', null),
    ('Clothing', 2799, 'Clothing', interval '55 days', 'saved', 'Sale'),
    ('Health checkup', 1800, 'Health', interval '60 days', 'saved', null),
    ('Entertainment park', 1100, 'Entertainment', interval '65 days', 'saved', null),
    ('Vegetables market', 520, 'Groceries', interval '70 days', 'saved', null),
    ('Wi‑Fi bill', 899, 'Mobile & Internet', interval '75 days', 'saved', null),
    ('Cab airport', 620, 'Cab & Auto', interval '80 days', 'saved', null),
    ('Misc', 199, 'Other', interval '85 days', 'saved', null)
  ) as v(title, amount, category, ago, status, notes)
)
insert into public.transactions (
  user_id,
  title,
  amount,
  category,
  booked_at,
  status,
  notes
)
select
  owner.user_id,
  rows.title,
  rows.amount,
  rows.category,
  (now() at time zone 'Asia/Kolkata') - rows.ago,
  rows.status,
  rows.notes
from rows
cross join owner
where owner.user_id is not null;

-- If 0 rows inserted: fix the email in the CTE `owner` or sign in once so auth.users has your row.
--
-- Undo only this seed (same email, titles match — careful if you created matching titles manually):
-- delete from public.transactions t
-- using auth.users u
-- where t.user_id = u.id
--   and u.email = 'vinodkumar.nelanakula@gmail.com'
--   and t.title in (
--     'Morning chai', 'Swiggy lunch', 'Metro card top-up', 'BigBasket groceries',
--     'Netflix', 'Uber to office', 'Petrol', 'Pharmacy', 'Amazon order', 'Electricity bill'
--     -- extend list or delete by booked_at range instead
--   );
