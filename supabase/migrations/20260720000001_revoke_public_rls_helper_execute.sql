-- Truthlabel Supabase security advisor fix.
-- The public.rls_auto_enable() helper should not be callable from the REST API.
-- This keeps the function in place but blocks anon/authenticated browser calls.

revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
revoke execute on function public.rls_auto_enable() from public;
