-- ============================================================
-- Code-Based Invite System Migration (CORRECTED)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 0. Drop ALL possible overloads to avoid "ambiguous function" errors
DROP FUNCTION IF EXISTS public.create_org_invite(text, public.org_role) CASCADE;
DROP FUNCTION IF EXISTS public.create_org_invite(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_org_invite(text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.create_org_invite(p_invited_email text, p_role public.org_role) CASCADE;
DROP FUNCTION IF EXISTS public.create_org_invite(p_invited_email text, p_role text) CASCADE;
DROP FUNCTION IF EXISTS public.create_org_invite(p_role text, p_invited_email text, p_expires_days integer) CASCADE;
DROP FUNCTION IF EXISTS public.accept_org_invite(text) CASCADE;
DROP FUNCTION IF EXISTS public.accept_org_invite(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.accept_org_invite(p_token text) CASCADE;
DROP FUNCTION IF EXISTS public.accept_org_invite(p_token uuid) CASCADE;
DROP FUNCTION IF EXISTS public.accept_org_invite(p_code text) CASCADE;
DROP FUNCTION IF EXISTS public.get_org_invites() CASCADE;

-- 1. Modify org_invites table
ALTER TABLE public.org_invites 
  ALTER COLUMN invited_email DROP NOT NULL;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='org_invites' AND column_name='code') THEN
        ALTER TABLE public.org_invites ADD COLUMN code VARCHAR(6) UNIQUE;
    END IF;
END $$;

-- 2. Helper: generate a unique 6-char uppercase code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
  chars  TEXT    := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT    := '';
  i      INTEGER;
  attempts INTEGER := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * 36)::int + 1, 1);
    END LOOP;

    -- Make sure it's unique and not yet used
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.org_invites WHERE code = result AND accepted_at IS NULL
    );

    attempts := attempts + 1;
    IF attempts > 20 THEN
      RAISE EXCEPTION 'Could not generate a unique invite code after 20 attempts';
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

-- 3. Create org invite RPC (Alphanumeric Code style)
CREATE OR REPLACE FUNCTION public.create_org_invite(
  p_role          TEXT    DEFAULT 'member',
  p_invited_email TEXT    DEFAULT NULL,
  p_expires_days  INTEGER DEFAULT 7
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id   UUID;
  v_user_role TEXT;
  v_code     VARCHAR(6);
  v_expires  TIMESTAMPTZ;
BEGIN
  -- 1. Get current org from JWT context
  v_org_id := public.current_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No active organization found in your session.';
  END IF;

  -- 2. Check permission (only owner/admin of THIS org can invite)
  SELECT role::text INTO v_user_role
  FROM public.user_organizations
  WHERE organization_id = v_org_id AND user_id = auth.uid();

  IF v_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only owners and admins can create invites.';
  END IF;

  -- 3. Validate role for the new member
  IF p_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'Invalid role specified: %', p_role;
  END IF;

  -- 4. Generate & Insert
  v_code    := generate_invite_code();
  v_expires := now() + (p_expires_days || ' days')::interval;

  INSERT INTO public.org_invites (
    organization_id,
    invited_by,
    invited_email,
    role,
    code,
    expires_at
  ) VALUES (
    v_org_id,
    auth.uid(),
    p_invited_email,
    p_role::public.org_role,
    v_code,
    v_expires
  );

  RETURN json_build_object(
    'code',       v_code,
    'expires_at', v_expires
  );
END;
$$;

-- 4. Accept invite RPC
CREATE OR REPLACE FUNCTION public.accept_org_invite(
  p_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite  RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to accept an invite.';
  END IF;

  -- 1. Find valid invite
  SELECT * INTO v_invite
  FROM public.org_invites
  WHERE code = upper(trim(p_code))
    AND accepted_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code.';
  END IF;

  -- 2. Join the organization (Note: user_organizations table name used here)
  INSERT INTO public.user_organizations (organization_id, user_id, role)
  VALUES (v_invite.organization_id, v_user_id, v_invite.role)
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  -- 3. Mark as accepted
  UPDATE public.org_invites
  SET accepted_at = now()
  WHERE id = v_invite.id;

  RETURN json_build_object(
    'organization_id', v_invite.organization_id,
    'role',            v_invite.role
  );
END;
$$;

-- 5. Helper to list invites for the current org
CREATE OR REPLACE FUNCTION public.get_org_invites()
RETURNS TABLE (
  id           uuid,
  code         text,
  role         text,
  expires_at   timestamptz,
  created_at   timestamptz,
  invited_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.code::text,
    i.role::text,
    i.expires_at,
    i.created_at,
    i.invited_email
  FROM public.org_invites i
  WHERE i.organization_id = public.current_org_id()
    AND i.accepted_at IS NULL
    AND i.expires_at > now()
  ORDER BY i.created_at DESC;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.create_org_invite(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_org_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_invites() TO authenticated;
