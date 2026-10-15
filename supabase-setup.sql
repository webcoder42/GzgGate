-- Arclane (GzgGate) — Supabase authentication + role-based access setup
-- Open Supabase -> SQL Editor -> New query, paste all of this, then Run.
-- Safe to run more than once.

-- =========================================================
-- 1) Profiles table: one row per user, stores role + name
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 2) Row Level Security
-- =========================================================
alter table public.profiles enable row level security;

-- A user can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Admins can read every profile.
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- A user can update their own profile (name/email), but not escalate role.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- =========================================================
-- 3) Auto-create a profile whenever a new user signs up
--    (both email/password and Google)
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 4) Make an account an Administrator
--    Replace the email below with the admin account's email.
-- =========================================================
update public.profiles
set role = 'admin'
where email = 'your-admin@example.com';
