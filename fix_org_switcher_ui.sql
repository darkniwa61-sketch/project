DROP FUNCTION IF EXISTS public.get_my_organizations();

CREATE OR REPLACE FUNCTION public.get_my_organizations()
RETURNS TABLE (
  organization_id uuid,
  name text,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uo.organization_id,
    o.name,
    uo.role::text,
    -- Determine if it's the active workspace by checking the JWT
    (uo.organization_id = public.current_org_id()) as is_active
  FROM public.user_organizations uo
  JOIN public.organizations o ON o.id = uo.organization_id
  WHERE uo.user_id = auth.uid()
  ORDER BY 
    (uo.organization_id = public.current_org_id()) DESC, -- Active org on top
    o.name ASC;
END;
$$;

-- Ensure users have permission
GRANT EXECUTE ON FUNCTION public.get_my_organizations() TO authenticated;
