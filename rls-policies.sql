-- Enable RLS (already done, but good practice to ensure)
ALTER TABLE public.reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Allow anyone (anon) to SELECT approved reasons
CREATE POLICY "Allow public read of approved reasons" 
ON public.reasons
FOR SELECT 
TO anon, authenticated
USING (status = 'approved');

-- 2. Policy: Allow anyone (anon) to INSERT new pending reasons
CREATE POLICY "Allow public insert of pending reasons" 
ON public.reasons
FOR INSERT 
TO anon, authenticated
WITH CHECK (status = 'pending');

-- 3. Policy: Allow anyone to read system status
CREATE POLICY "Allow public read of system status" 
ON public.system_status
FOR SELECT 
TO anon, authenticated
USING (true);

-- Note: Admin operations (approving, deleting, etc.) can be done through the Supabase Dashboard,
-- or by setting up an admin API route using the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
