-- =====================================================================
-- Arclane · Quote requests (submitted shipping request forms)
-- Run this in Supabase → SQL Editor. Safe to re-run.
-- Requires supabase-setup.sql (profiles) and supabase-rates.sql (is_admin()).
-- =====================================================================

create table if not exists public.quote_requests (
  id                 uuid primary key default gen_random_uuid(),
  reference          text unique,
  user_id            uuid references auth.users (id) on delete set null,
  origin_country     text,
  destination_country text,
  origin             text,
  destination        text,
  pickup             text,
  delivery           text,
  method             text,
  load_type          text,
  equipment          text,
  cargo              text,
  ready_date         date,
  weight             text,
  volume             text,
  pieces             text,
  special_handling   text,
  cargo_description  text,
  incoterm           text,
  contact_name       text,
  company            text,
  email              text,
  phone              text,
  notes              text,
  rate_id            text,
  status             text not null default 'Pending Review',
  created_at         timestamptz not null default now()
);

create index if not exists quote_requests_user_idx on public.quote_requests (user_id);
create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

alter table public.quote_requests enable row level security;

drop policy if exists "quote_requests insert own" on public.quote_requests;
create policy "quote_requests insert own"
  on public.quote_requests for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "quote_requests read own or admin" on public.quote_requests;
create policy "quote_requests read own or admin"
  on public.quote_requests for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "quote_requests admin update" on public.quote_requests;
create policy "quote_requests admin update"
  on public.quote_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "quote_requests admin delete" on public.quote_requests;
create policy "quote_requests admin delete"
  on public.quote_requests for delete to authenticated
  using (public.is_admin());

-- Optional: view every submitted request (run in SQL Editor as you, which bypasses RLS)
-- select reference, contact_name, email, origin, destination, method, status, created_at
-- from public.quote_requests order by created_at desc;
