-- Truthlabel paid access database setup.
-- Run this in Supabase SQL Editor after creating the Truthlabel project.
-- This creates user settings plus Gumroad subscription access tables with RLS.

-- =========================================================
-- TRUTHLABEL USER SETTINGS
-- =========================================================

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,

  display_name text,

  selected_allergens text[] not null default '{}',
  custom_watch_list text[] not null default '{}',

  highlight_gmo boolean not null default true,
  highlight_cell_cultured boolean not null default true,
  highlight_precision_fermentation boolean not null default true,
  highlight_artificial_colors boolean not null default true,
  highlight_artificial_sweeteners boolean not null default true,
  highlight_processed_oils boolean not null default true,
  highlight_ultra_processed boolean not null default true,

  local_settings_migrated boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users read own settings"
on public.user_settings;

create policy "Users read own settings"
on public.user_settings
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users create own settings"
on public.user_settings;

create policy "Users create own settings"
on public.user_settings
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own settings"
on public.user_settings;

create policy "Users update own settings"
on public.user_settings
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own settings"
on public.user_settings;

create policy "Users delete own settings"
on public.user_settings
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- =========================================================
-- GUMROAD SUBSCRIPTIONS
-- =========================================================

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,

  provider text not null default 'gumroad'
    check (provider = 'gumroad'),

  gumroad_product_id text not null,
  gumroad_sale_id text unique,
  gumroad_subscription_id text unique,
  gumroad_email text,

  license_key_hash text not null unique,

  status text not null default 'inactive'
    check (
      status in (
        'inactive',
        'active',
        'active_until_end',
        'payment_failed',
        'expired',
        'refunded',
        'disputed',
        'chargebacked'
      )
    ),

  access_ends_at timestamptz,
  last_verified_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscription"
on public.subscriptions;

create policy "Users read own subscription"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Do not create browser INSERT, UPDATE or DELETE policies.
-- Only the protected server function may change subscription access.


-- =========================================================
-- AUTOMATIC UPDATED_AT
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_settings_set_updated_at
on public.user_settings;

create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at
on public.subscriptions;

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();
