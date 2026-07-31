-- Truthlabel onboarding state.
--
-- These fields let the app resume a user's onboarding after refresh and avoid
-- showing onboarding again once it has been completed.

alter table public.user_settings
add column if not exists current_onboarding_step integer not null default 1
  check (current_onboarding_step between 1 and 4),
add column if not exists onboarding_started_at timestamptz,
add column if not exists onboarding_completed_at timestamptz,
add column if not exists allergy_setup_completed boolean not null default false,
add column if not exists install_prompt_seen boolean not null default false,
add column if not exists install_prompt_outcome text,
add column if not exists app_install_status text;

alter table public.user_settings
drop constraint if exists user_settings_install_prompt_outcome_check;

alter table public.user_settings
add constraint user_settings_install_prompt_outcome_check
check (
  install_prompt_outcome is null
  or install_prompt_outcome in (
    'accepted',
    'dismissed',
    'deferred',
    'manual_confirmed',
    'unsupported',
    'already_installed'
  )
);

alter table public.user_settings
drop constraint if exists user_settings_app_install_status_check;

alter table public.user_settings
add constraint user_settings_app_install_status_check
check (
  app_install_status is null
  or app_install_status in (
    'unknown',
    'not_installed',
    'installed',
    'manual_confirmed',
    'unsupported'
  )
);

create index if not exists user_settings_onboarding_completed_idx
on public.user_settings (onboarding_completed_at);

create index if not exists user_settings_current_onboarding_step_idx
on public.user_settings (current_onboarding_step);
