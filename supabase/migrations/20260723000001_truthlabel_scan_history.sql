-- Truthlabel private scan history.
-- Run this in Supabase SQL Editor after the paid-access tables are installed.
-- It stores searchable scan summaries plus a complete immutable result snapshot.

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  barcode text,
  product_name text not null default 'Unknown product',
  brand text,
  product_image_url text,

  score integer check (score is null or (score >= 0 and score <= 100)),
  overall_severity text not null
    check (overall_severity in ('green', 'yellow', 'red')),
  verdict_key text not null,
  verdict_label text not null,

  green_count integer not null default 0 check (green_count >= 0),
  yellow_count integer not null default 0 check (yellow_count >= 0),
  red_count integer not null default 0 check (red_count >= 0),
  serious_red_count integer not null default 0 check (serious_red_count >= 0),
  overload_red_count integer not null default 0 check (overload_red_count >= 0),
  allergen_red_count integer not null default 0 check (allergen_red_count >= 0),
  high_processing_load boolean not null default false,

  scanned_at timestamptz not null default now(),
  result_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.scan_history enable row level security;

drop policy if exists "Users read own scan history"
on public.scan_history;

create policy "Users read own scan history"
on public.scan_history
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users create own scan history"
on public.scan_history;

create policy "Users create own scan history"
on public.scan_history
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own scan history"
on public.scan_history;

create policy "Users delete own scan history"
on public.scan_history
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists scan_history_user_scanned_at_idx
on public.scan_history (user_id, scanned_at desc);

create index if not exists scan_history_user_severity_idx
on public.scan_history (user_id, overall_severity);

create index if not exists scan_history_user_barcode_idx
on public.scan_history (user_id, barcode);

create index if not exists scan_history_user_product_name_idx
on public.scan_history (user_id, lower(product_name));

create index if not exists scan_history_user_brand_idx
on public.scan_history (user_id, lower(brand));
