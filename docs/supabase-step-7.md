# Truthlabel Step 7: Supabase Database SQL

This step prepares the database for paid accounts, saved user settings, allergy preferences, watch-list items, and Gumroad subscription status.

## What Codex Prepared

The SQL file is here:

`supabase/migrations/20260720000000_truthlabel_paid_access.sql`

It creates:

- `public.user_settings`
- `public.subscriptions`
- Row Level Security for users reading/writing only their own settings
- Read-only user access to their own subscription status
- No browser insert/update/delete policies for subscriptions
- `updated_at` triggers

## User Action

1. Open Supabase.
2. Open the `Truthlabel` project.
3. Go to `SQL Editor`.
4. Click `New query`.
5. Paste the full SQL from `supabase/migrations/20260720000000_truthlabel_paid_access.sql`.
6. Click `Run`.
7. Then go to `Database -> Security Advisor` and check for missing RLS or unsafe public access warnings.

## Security Advisor Follow-Up Applied

If Supabase warns that `public.rls_auto_enable()` is callable by `anon` or `authenticated`, run:

```sql
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
revoke execute on function public.rls_auto_enable() from public;
```

This follow-up is saved in:

`supabase/migrations/20260720000001_revoke_public_rls_helper_execute.sql`

Do not paste Supabase secret keys into the app or chat. The subscription table is designed so browser users can only read their own subscription status; later Gumroad activation must update it through a protected server/edge function.
