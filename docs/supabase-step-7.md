# Truthlabel Step 7: Supabase Database SQL

This step prepares the database for paid accounts, 7-day trials, saved user settings, allergy preferences, watch-list items, and Gumroad subscription status.

## What Codex Prepared

The SQL file is here:

`supabase/migrations/20260720000000_truthlabel_paid_access.sql`

The 7-day trial follow-up SQL file is here:

`supabase/migrations/20260720000002_truthlabel_trial_access.sql`

It creates:

- `public.user_settings`
- `public.subscriptions`
- `public.trial_access`
- Row Level Security for users reading/writing only their own settings
- Read-only user access to their own subscription status
- Read-only user access to their own trial window
- Automatic 7-day trial creation when a Supabase account is created
- No browser insert/update/delete policies for subscriptions
- No browser insert/update/delete policies for trial access
- `updated_at` triggers

## User Action

1. Open Supabase.
2. Open the `Truthlabel` project.
3. Go to `SQL Editor`.
4. Click `New query`.
5. Paste the full SQL from `supabase/migrations/20260720000000_truthlabel_paid_access.sql`.
6. Click `Run`.
7. Paste the full SQL from `supabase/migrations/20260720000002_truthlabel_trial_access.sql`.
8. Click `Run`.
9. Then go to `Database -> Security Advisor` and check for missing RLS or unsafe public access warnings.

## Security Advisor Follow-Up Applied

If Supabase warns that `public.rls_auto_enable()` is callable by `anon` or `authenticated`, run:

```sql
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
revoke execute on function public.rls_auto_enable() from public;
```

This follow-up is saved in:

`supabase/migrations/20260720000001_revoke_public_rls_helper_execute.sql`

If Supabase warns that `public.create_trial_access_for_new_user()` is callable by `anon` or `authenticated`, run the revoke statements included at the bottom of:

`supabase/migrations/20260720000002_truthlabel_trial_access.sql`

Do not paste Supabase secret keys into the app or chat. The subscription table is designed so browser users can only read their own subscription status; later Gumroad activation must update it through a protected server/edge function. The trial table is designed so browser users can read their trial end date, but cannot extend the trial from the client.
