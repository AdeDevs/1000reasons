-- Fix 1: Revoke execute privileges on rls_auto_enable from public/anon/authenticated
-- This fixes the Supabase lint warnings about "Public/Signed-In Users Can Execute SECURITY DEFINER Function"
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- Fix 2: Grant necessary table permissions to the 'anon' role
-- Since our Express backend is currently using the 'publishable' (anon) key,
-- it needs permission to read and insert data into our tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reasons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_status TO anon;

-- Note: Alternatively, if you use the Supabase "Secret key" (service_role key) 
-- in your backend instead of the publishable key, you won't need these table grants,
-- because the service key bypasses these permissions automatically.
