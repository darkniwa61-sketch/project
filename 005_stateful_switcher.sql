-- ============================================================
-- Migration 005: Stateful Organization Switcher
-- ============================================================

-- 1. Add active_org_id to profiles so we can persist the user's choice
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 2. Update the Auth Hook to respect the active_org_id state!
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_user_id  uuid;
  v_org_id   uuid;
  v_org_role text;
  v_claims   jsonb;
BEGIN
  v_user_id := (event ->> 'user_id')::uuid;

  -- Attempt to get their actively selected org from profiles
  SELECT p.active_org_id INTO v_org_id
  FROM public.profiles p
  WHERE p.id = v_user_id;

  -- Validate they still actually belong to this active org, and fetch their role
  IF v_org_id IS NOT NULL THEN
    SELECT uo.role::text INTO v_org_role
    FROM public.user_organizations uo
    WHERE uo.user_id = v_user_id AND uo.organization_id = v_org_id;
    
    -- If they don't belong to it anymore (e.g. they were kicked), nullify it so it falls back
    IF v_org_role IS NULL THEN
      v_org_id := NULL;
    END IF;
  END IF;

  -- Fallback: If no active org is set, simply grab the highest privilege org they belong to
  IF v_org_id IS NULL THEN
    SELECT uo.organization_id, uo.role::text
    INTO   v_org_id, v_org_role
    FROM   public.user_organizations uo
    WHERE  uo.user_id = v_user_id
    ORDER  BY
      CASE uo.role
        WHEN 'owner'  THEN 1
        WHEN 'admin'  THEN 2
        ELSE               3
      END
    LIMIT 1;
  END IF;

  v_claims := event -> 'claims';

  IF v_org_id IS NOT NULL THEN
    v_claims := jsonb_set(v_claims, '{org_id}',   to_jsonb(v_org_id::text));
    v_claims := jsonb_set(v_claims, '{org_role}', to_jsonb(v_org_role));
  END IF;

  RETURN jsonb_set(event, '{claims}', v_claims);
END;
$$;

-- Ensure execution is locked strictly to Supabase Auth
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;


-- 3. Create the RPC for the Next.js frontend to switch organizations easily
CREATE OR REPLACE FUNCTION public.switch_active_organization(new_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user actually belongs to the org they are attempting to switch to
  IF NOT EXISTS (
    SELECT 1 FROM public.user_organizations 
    WHERE user_id = auth.uid() AND organization_id = new_org_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not belong to this organization.';
  END IF;

  -- Update their profile
  UPDATE public.profiles SET active_org_id = new_org_id WHERE id = auth.uid();
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.switch_active_organization(uuid) TO authenticated;
