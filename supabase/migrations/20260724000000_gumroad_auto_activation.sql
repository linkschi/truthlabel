-- Truthlabel Gumroad automatic activation support.
-- Allows the Gumroad purchase ping/webhook to activate an account by matching
-- the buyer email to a Truthlabel user, even when the ping does not include a
-- license key. Manual license-key activation remains supported.

alter table public.subscriptions
alter column license_key_hash drop not null;

create table if not exists public.gumroad_purchase_events (
  id uuid primary key default gen_random_uuid(),

  gumroad_sale_id text unique,
  gumroad_subscription_id text unique,
  gumroad_email text not null,
  gumroad_product_id text,
  gumroad_permalink text,

  status text not null default 'active'
    check (
      status in (
        'active',
        'active_until_end',
        'payment_failed',
        'expired',
        'refunded',
        'disputed',
        'chargebacked'
      )
    ),

  matched_user_id uuid references auth.users(id) on delete set null,
  processed_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gumroad_purchase_events enable row level security;

-- No browser policies on gumroad_purchase_events.
-- Only Supabase service-role code should read/write these purchase events.

grant usage on schema public to service_role;
grant select, insert, update, delete on public.gumroad_purchase_events to service_role;
grant select, insert, update, delete on public.subscriptions to service_role;

drop trigger if exists gumroad_purchase_events_set_updated_at
on public.gumroad_purchase_events;

create trigger gumroad_purchase_events_set_updated_at
before update on public.gumroad_purchase_events
for each row
execute function public.set_updated_at();

create index if not exists gumroad_purchase_events_email_idx
on public.gumroad_purchase_events (lower(gumroad_email));

create index if not exists gumroad_purchase_events_subscription_idx
on public.gumroad_purchase_events (gumroad_subscription_id);

create index if not exists gumroad_purchase_events_matched_user_idx
on public.gumroad_purchase_events (matched_user_id);


-- =========================================================
-- PRIVATE USER EMAIL LOOKUP FOR GUMROAD MATCHING
-- =========================================================

create table if not exists public.user_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  normalized_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_accounts enable row level security;

-- No browser policies on user_accounts.
-- This table exists only so trusted server code can match a Gumroad purchase
-- email to the user's Truthlabel account without exposing auth.users.

grant select, insert, update, delete on public.user_accounts to service_role;

create index if not exists user_accounts_normalized_email_idx
on public.user_accounts (normalized_email);

create or replace function public.sync_truthlabel_user_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_accounts (user_id, email, normalized_email)
  values (
    new.id,
    coalesce(new.email, ''),
    pg_catalog.lower(coalesce(new.email, ''))
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    normalized_email = excluded.normalized_email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists truthlabel_sync_user_account
on auth.users;

create trigger truthlabel_sync_user_account
after insert or update of email on auth.users
for each row
execute function public.sync_truthlabel_user_account();

insert into public.user_accounts (user_id, email, normalized_email)
select id, email, pg_catalog.lower(email)
from auth.users
where email is not null
on conflict (user_id) do update
set
  email = excluded.email,
  normalized_email = excluded.normalized_email,
  updated_at = now();

revoke execute on function public.sync_truthlabel_user_account() from anon;
revoke execute on function public.sync_truthlabel_user_account() from authenticated;
revoke execute on function public.sync_truthlabel_user_account() from public;
