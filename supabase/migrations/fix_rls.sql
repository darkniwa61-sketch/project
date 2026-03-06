-- Fix Infinite Recursion for Profiles RLS
-- The previous policies queried the `profiles` table while checking permissions FOR the `profiles` table, causing an infinite loop.

-- 1. Remove the problematic recursive profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by admin." ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update profiles." ON public.profiles;

-- Ensure the direct user-access policy exists (no recursion here)
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING ( auth.uid() = id );

-- *Note: Admins don't need a client-side SELECT or UPDATE policy for all profiles because the Next.js `/dashboard/users` page uses the highly-privileged Service Role Key (which naturally bypasses ALL RLS).*
-- *Note 2: The `inventory` policies still use a subselect to `profiles`. This is perfectly safe (no infinite recursion) because you are querying a DIFFERENT table!*
