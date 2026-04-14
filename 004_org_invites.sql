-- ============================================================
-- Migration 004: Organization Invites System
-- ============================================================

-- 1. Create org_invites table
CREATE TABLE IF NOT EXISTS public.org_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for fast querying by token
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.org_invites(token);

-- Secure it via RLS
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

-- Admins/Owners can read their org's invites
CREATE POLICY "Orgs can see their invites" ON public.org_invites FOR SELECT USING (
  organization_id = public.current_org_id()
);

-- Admins/Owners can create new invites
CREATE POLICY "Orgs can create invites" ON public.org_invites FOR INSERT WITH CHECK (
  organization_id = public.current_org_id() AND
  (auth.jwt() ->> 'org_role') IN ('owner', 'admin')
);

-- Admins can revoke/delete open invites
CREATE POLICY "Orgs can delete invites" ON public.org_invites FOR DELETE USING (
  organization_id = public.current_org_id() AND
  (auth.jwt() ->> 'org_role') IN ('owner', 'admin')
);


-- 2. RPC to Accept Invite securely
-- Bypasses RLS temporarily (security definer) so an invited user who is NOT yet 
-- part of the organization can validate and consume the token!
CREATE OR REPLACE FUNCTION public.handle_join_organization(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite record;
  caller_email text;
BEGIN
  -- We must look up the caller's email safely from auth.users
  SELECT email INTO caller_email FROM auth.users WHERE id = auth.uid();

  -- 1. Find a valid invite that matches the token
  -- Also verifies the invite email strictly matches the user's logged in email
  SELECT * INTO v_invite 
  FROM public.org_invites
  WHERE token = p_token 
    AND invited_email = caller_email
    AND accepted_at IS NULL 
    AND expires_at > now();

  IF v_invite IS NULL THEN
    RAISE EXCEPTION 'Invalid, expired, or already claimed invite token.';
  END IF;

  -- 2. Insert user into the organization!
  INSERT INTO public.user_organizations (user_id, organization_id, role)
  VALUES (auth.uid(), v_invite.organization_id, v_invite.role)
  ON CONFLICT (user_id, organization_id) DO NOTHING;

  -- 3. Mark invite as consumed
  UPDATE public.org_invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success', true, 
    'organization_id', v_invite.organization_id
  );
END;
$$;
