-- ============================================================
-- Fix: Ensure active_org_id is set for all existing users
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure the column exists (safe, idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 2. For any user whose active_org_id is NULL, auto-assign their 
--    highest-privilege org (owner > admin > member)
UPDATE public.profiles p
SET active_org_id = (
  SELECT uo.organization_id
  FROM public.user_organizations uo
  WHERE uo.user_id = p.id
  ORDER BY
    CASE uo.role
      WHEN 'owner'  THEN 1
      WHEN 'admin'  THEN 2
      ELSE               3
    END
  LIMIT 1
)
WHERE p.active_org_id IS NULL;

-- 3. Verify: check your own profile (run after step 2)
-- SELECT p.id, p.active_org_id, uo.organization_id, uo.role, o.name
-- FROM public.profiles p
-- LEFT JOIN public.user_organizations uo ON uo.user_id = p.id
-- LEFT JOIN public.organizations o ON o.id = uo.organization_id
-- WHERE p.id = auth.uid();
