-- Arclane (GzgGate) — Freight rates stored in Supabase
-- Run in Supabase -> SQL Editor AFTER supabase-setup.sql (needs public.profiles).
-- Safe to run more than once.

-- is_admin(): true when the signed-in user has the admin role in profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Rates table (one row per freight rate / lane)
create table if not exists public.rates (
  id text primary key,
  origin text not null default '',
  origin_country text not null default '',
  destination text not null default '',
  destination_country text not null default '',
  service text not null default 'Sea Freight',
  equipment text not null default '',
  unit text not null default 'container',
  price numeric,
  transit text not null default '',
  updated text not null default '',
  availability text not null default 'Published',
  created_at timestamptz not null default now()
);

alter table public.rates enable row level security;

-- The public rate directory can read every rate.
drop policy if exists "rates_read_all" on public.rates;
create policy "rates_read_all" on public.rates for select using (true);

-- Only administrators can add, edit, or remove rates.
drop policy if exists "rates_admin_insert" on public.rates;
create policy "rates_admin_insert" on public.rates for insert with check (public.is_admin());

drop policy if exists "rates_admin_update" on public.rates;
create policy "rates_admin_update" on public.rates for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "rates_admin_delete" on public.rates;
create policy "rates_admin_delete" on public.rates for delete using (public.is_admin());

-- Make sure your admin account is an admin in the database (replace email if needed),
-- otherwise writes will be blocked by row level security.
insert into public.profiles (id, email, full_name, role)
select id, email,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', split_part(email, '@', 1)),
  'admin'
from auth.users
where email = 'earnlearn400@gmail.com'
on conflict (id) do update set role = 'admin';

-- The rates table starts empty. Add your real rates from the admin dashboard.
-- (No demo/seed rows are inserted.)

