-- Arclane (GzgGate) — Saved routes per user
-- Run in Supabase -> SQL Editor AFTER supabase-setup.sql and supabase-rates.sql.
-- Safe to run more than once.

create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rate_id text not null references public.rates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, rate_id)
);

alter table public.saved_routes enable row level security;

-- Each user can only see and manage their own saved routes.
drop policy if exists "saved_routes_select_own" on public.saved_routes;
create policy "saved_routes_select_own" on public.saved_routes
  for select using (auth.uid() = user_id);

drop policy if exists "saved_routes_insert_own" on public.saved_routes;
create policy "saved_routes_insert_own" on public.saved_routes
  for insert with check (auth.uid() = user_id);

drop policy if exists "saved_routes_delete_own" on public.saved_routes;
create policy "saved_routes_delete_own" on public.saved_routes
  for delete using (auth.uid() = user_id);
