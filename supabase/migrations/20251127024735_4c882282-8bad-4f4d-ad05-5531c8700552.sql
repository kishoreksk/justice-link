-- Create security definer function to get current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Fix the professional access policies to use the security definer function

-- 1. Fix disputes table policy
DROP POLICY IF EXISTS "Professionals can view assigned disputes" ON public.disputes;

CREATE POLICY "Professionals can view assigned disputes"
ON public.disputes
FOR SELECT
USING (
  has_role(auth.uid(), 'professional'::app_role) 
  AND assigned_professional_id IN (
    SELECT id FROM professionals 
    WHERE email = get_current_user_email()
  )
);

-- 2. Fix dispute_documents table policy
DROP POLICY IF EXISTS "Professionals can view assigned dispute documents" ON public.dispute_documents;

CREATE POLICY "Professionals can view assigned dispute documents"
ON public.dispute_documents
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals 
      WHERE email = get_current_user_email()
    )
  )
);

-- 3. Fix dispute_meetings table policy
DROP POLICY IF EXISTS "Professionals can view assigned dispute meetings" ON public.dispute_meetings;

CREATE POLICY "Professionals can view assigned dispute meetings"
ON public.dispute_meetings
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals 
      WHERE email = get_current_user_email()
    )
  )
);

-- 4. Fix case_updates table policy
DROP POLICY IF EXISTS "Professionals can view assigned case updates" ON public.case_updates;

CREATE POLICY "Professionals can view assigned case updates"
ON public.case_updates
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals 
      WHERE email = get_current_user_email()
    )
  )
);