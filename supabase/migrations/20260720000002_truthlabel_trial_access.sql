-- Truthlabel 7-day free trial access.
-- Run after the paid access migration.
-- Trial rows are readable by the signed-in user but not browser-editable.

create table if not exists public.trial_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trial_access enable row level security;

drop policy if exists "Users read own trial access"
on public.trial_access;

create policy "Users read own trial access"
on public.trial_access
for select
to authenticated
using ((select auth.uid()) = user_id);

-- No browser INSERT, UPDATE, or DELETE policies.
-- A user can read their trial window, but cannot extend it from the client.

create or replace function public.create_trial_access_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.trial_access (user_id, trial_started_at, trial_ends_at)
  values (new.id, new.created_at, new.created_at + interval '7 days')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists truthlabel_create_trial_access
on auth.users;

create trigger truthlabel_create_trial_access
after insert on auth.users
for each row
execute function public.create_trial_access_for_new_user();

-- Backfill existing accounts based on their original account creation date.
insert into public.trial_access (user_id, trial_started_at, trial_ends_at)
select id, created_at, created_at + interval '7 days'
from auth.users
on conflict (user_id) do nothing;

-- Keep helper functions out of the public API surface.
revoke execute on function public.create_trial_access_for_new_user() from anon;
revoke execute on function public.create_trial_access_for_new_user() from authenticated;
revoke execute on function public.create_trial_access_for_new_user() from public;
