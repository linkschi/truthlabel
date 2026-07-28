-- Truthlabel app reliability analytics.
-- Run this in Supabase SQL Editor before relying on production analytics storage.
-- Events are written through the server API using SUPABASE_SERVICE_ROLE_KEY.
-- Do not add browser SELECT policies for this table.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),

  event_name text not null
    check (event_name ~ '^[a-z0-9_]{3,80}$'),

  anonymous_id text not null
    check (char_length(anonymous_id) between 3 and 120),

  user_id uuid references auth.users(id) on delete set null,

  route_path text,
  referrer_path text,

  app_version text,
  build_date text,

  device_type text
    check (device_type is null or device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  os_name text,
  browser_name text,
  viewport_width integer check (viewport_width is null or viewport_width >= 0),
  viewport_height integer check (viewport_height is null or viewport_height >= 0),

  metadata jsonb not null default '{}'::jsonb,

  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

-- No anon/authenticated policies on purpose:
-- client browsers send events to /api/analytics/events, and the server writes
-- with SUPABASE_SERVICE_ROLE_KEY. This keeps analytics private.

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_name_created_at_idx
on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_user_created_at_idx
on public.analytics_events (user_id, created_at desc)
where user_id is not null;

create index if not exists analytics_events_anonymous_created_at_idx
on public.analytics_events (anonymous_id, created_at desc);

create index if not exists analytics_events_metadata_gin_idx
on public.analytics_events using gin (metadata);
