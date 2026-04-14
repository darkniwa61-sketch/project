-- ============================================================
-- FIX: JWT Claim Path Mismatch & Insert Defaults
-- ============================================================

-- 1. Standardize fetching the org_id from the root JWT claims
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'org_id')::uuid;
$$;

-- 2. Drop the incorrect app_metadata defaults on the domain tables
ALTER TABLE public.inventory ALTER COLUMN organization_id DROP DEFAULT;
ALTER TABLE public.activities ALTER COLUMN organization_id DROP DEFAULT;

-- 3. Create a reliable trigger to auto-stamp organization_id on inserts
CREATE OR REPLACE FUNCTION public.stamp_organization_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := public.current_org_id();
  END IF;

  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'stamp_organization_id: no org_id found in JWT for user %', auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to tables
DROP TRIGGER IF EXISTS trg_inventory_stamp_org ON public.inventory;
CREATE TRIGGER trg_inventory_stamp_org
  BEFORE INSERT ON public.inventory
  FOR EACH ROW EXECUTE PROCEDURE public.stamp_organization_id();

DROP TRIGGER IF EXISTS trg_activities_stamp_org ON public.activities;
CREATE TRIGGER trg_activities_stamp_org
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE PROCEDURE public.stamp_organization_id();


-- 4. Re-write the RLS policies correctly for Inventory
DROP POLICY IF EXISTS "Inventory viewable by org members" ON public.inventory;
DROP POLICY IF EXISTS "Inventory updatable by org members" ON public.inventory;
DROP POLICY IF EXISTS "Inventory insertable by org members with permission" ON public.inventory;
DROP POLICY IF EXISTS "Inventory updatable by org members with permission" ON public.inventory;
DROP POLICY IF EXISTS "Inventory deletable by org members with permission" ON public.inventory;

CREATE POLICY "tenant isolation: inventory"
  ON public.inventory FOR ALL
  USING (organization_id = public.current_org_id());

-- 4b. Re-write for Activities
DROP POLICY IF EXISTS "Activities viewable by org members" ON public.activities;
DROP POLICY IF EXISTS "Activities insertable by org members" ON public.activities;
DROP POLICY IF EXISTS "tenant isolation: activities" ON public.activities;

CREATE POLICY "tenant isolation: activities"
  ON public.activities FOR ALL
  USING (organization_id = public.current_org_id());

-- 5. Re-write for Orgs & User Orgs
DROP POLICY IF EXISTS "owners and admins can update org" ON public.organizations;
CREATE POLICY "owners and admins can update org" ON public.organizations FOR UPDATE USING (
    public.current_org_id() = id
    AND (auth.jwt() ->> 'org_role') IN ('owner', 'admin')
);

DROP POLICY IF EXISTS "members can view org members" ON public.user_organizations;
CREATE POLICY "members can view org members" ON public.user_organizations FOR SELECT USING (
    organization_id = public.current_org_id()
);

DROP POLICY IF EXISTS "owners and admins can manage members" ON public.user_organizations;
CREATE POLICY "owners and admins can manage members" ON public.user_organizations FOR ALL USING (
    organization_id = public.current_org_id()
    AND (auth.jwt() ->> 'org_role') IN ('owner', 'admin')
);
