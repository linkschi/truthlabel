-- Truthlabel now uses Gumroad's card-backed membership trial as the source of
-- free-trial access. Account creation alone should not create no-card app
-- access.

drop trigger if exists truthlabel_create_trial_access
on auth.users;

drop function if exists public.create_trial_access_for_new_user();
