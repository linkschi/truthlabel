-- Truthlabel pending Gumroad activation linking.
--
-- Supports checkout-first flows:
-- 1. Gumroad sends a purchase ping before a Truthlabel auth user exists.
-- 2. The ping is stored in gumroad_purchase_events by checkout email.
-- 3. When a matching Truthlabel account is later created, this trigger links
--    the latest active purchase event to the new user subscription.

create or replace function public.activate_pending_gumroad_purchase_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pending_purchase record;
  pending_access_ends_at timestamptz;
begin
  if new.normalized_email is null or new.normalized_email = '' then
    return new;
  end if;

  select event.*
  into pending_purchase
  from public.gumroad_purchase_events event
  where
    pg_catalog.lower(event.gumroad_email) = new.normalized_email
    and event.status in ('active', 'active_until_end')
    and event.gumroad_product_id is not null
    and (event.matched_user_id is null or event.matched_user_id = new.user_id)
    and not exists (
      select 1
      from public.subscriptions existing_subscription
      where
        existing_subscription.user_id <> new.user_id
        and (
          (
            event.gumroad_sale_id is not null
            and existing_subscription.gumroad_sale_id = event.gumroad_sale_id
          )
          or (
            event.gumroad_subscription_id is not null
            and existing_subscription.gumroad_subscription_id = event.gumroad_subscription_id
          )
        )
    )
  order by
    event.processed_at desc nulls last,
    event.updated_at desc,
    event.created_at desc
  limit 1;

  if pending_purchase.id is null then
    return new;
  end if;

  begin
    pending_access_ends_at :=
      nullif(
        coalesce(
          pending_purchase.raw_payload ->> 'subscription_ended_at',
          pending_purchase.raw_payload ->> 'access_ends_at',
          pending_purchase.raw_payload ->> 'ended_at',
          ''
        ),
        ''
      )::timestamptz;
  exception
    when others then
      pending_access_ends_at := null;
  end;

  insert into public.subscriptions (
    user_id,
    provider,
    gumroad_product_id,
    gumroad_sale_id,
    gumroad_subscription_id,
    gumroad_email,
    status,
    access_ends_at,
    last_verified_at
  )
  values (
    new.user_id,
    'gumroad',
    pending_purchase.gumroad_product_id,
    pending_purchase.gumroad_sale_id,
    pending_purchase.gumroad_subscription_id,
    pending_purchase.gumroad_email,
    pending_purchase.status,
    pending_access_ends_at,
    now()
  )
  on conflict (user_id) do update
  set
    provider = excluded.provider,
    gumroad_product_id = excluded.gumroad_product_id,
    gumroad_sale_id = excluded.gumroad_sale_id,
    gumroad_subscription_id = excluded.gumroad_subscription_id,
    gumroad_email = excluded.gumroad_email,
    status = excluded.status,
    access_ends_at = excluded.access_ends_at,
    last_verified_at = now(),
    updated_at = now();

  update public.gumroad_purchase_events
  set
    matched_user_id = new.user_id,
    updated_at = now()
  where
    pg_catalog.lower(gumroad_email) = new.normalized_email
    and (matched_user_id is null or matched_user_id = new.user_id);

  return new;
end;
$$;

drop trigger if exists truthlabel_activate_pending_gumroad_purchase
on public.user_accounts;

create trigger truthlabel_activate_pending_gumroad_purchase
after insert or update of normalized_email on public.user_accounts
for each row
execute function public.activate_pending_gumroad_purchase_for_user();

revoke execute on function public.activate_pending_gumroad_purchase_for_user() from anon;
revoke execute on function public.activate_pending_gumroad_purchase_for_user() from authenticated;
revoke execute on function public.activate_pending_gumroad_purchase_for_user() from public;
