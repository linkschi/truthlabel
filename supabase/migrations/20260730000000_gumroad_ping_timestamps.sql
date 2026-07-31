-- Truthlabel Gumroad ping timestamp tracking.
--
-- Keeps billing-event timing separate from processing timing:
-- - gumroad_event_at: when Gumroad says the billing event happened.
-- - ping_received_at: when Truthlabel received/processed the ping.
-- - cancellation_detected_at: when a cancellation/refund/chargeback style
--   access-ending signal was detected.

alter table public.gumroad_purchase_events
add column if not exists event_type text,
add column if not exists gumroad_event_at timestamptz,
add column if not exists ping_received_at timestamptz not null default now(),
add column if not exists cancellation_detected_at timestamptz;

alter table public.gumroad_purchase_events
drop constraint if exists gumroad_purchase_events_event_type_check;

alter table public.gumroad_purchase_events
add constraint gumroad_purchase_events_event_type_check
check (
  event_type is null
  or event_type in (
    'purchase',
    'renewal',
    'cancellation',
    'expiration',
    'payment_failed',
    'refund',
    'dispute',
    'chargeback',
    'unknown'
  )
);

alter table public.subscriptions
add column if not exists last_gumroad_event_at timestamptz,
add column if not exists last_gumroad_ping_received_at timestamptz,
add column if not exists cancellation_detected_at timestamptz;

create index if not exists gumroad_purchase_events_event_type_idx
on public.gumroad_purchase_events (event_type);

create index if not exists gumroad_purchase_events_gumroad_event_at_idx
on public.gumroad_purchase_events (gumroad_event_at);

create index if not exists gumroad_purchase_events_ping_received_at_idx
on public.gumroad_purchase_events (ping_received_at);

create index if not exists subscriptions_cancellation_detected_at_idx
on public.subscriptions (cancellation_detected_at);
