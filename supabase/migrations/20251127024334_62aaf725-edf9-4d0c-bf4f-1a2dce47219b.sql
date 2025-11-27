-- Fix critical RLS policy issues for professional access

-- 1. Fix disputes table - professionals should only see their OWN assigned disputes
DROP POLICY IF EXISTS "Professionals can view assigned disputes" ON public.disputes;

CREATE POLICY "Professionals can view assigned disputes"
ON public.disputes
FOR SELECT
USING (
  has_role(auth.uid(), 'professional'::app_role) 
  AND assigned_professional_id IN (
    SELECT id FROM professionals 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- 2. Fix dispute_documents table - professionals should only see documents from their assigned disputes
DROP POLICY IF EXISTS "Professionals can view assigned dispute documents" ON public.dispute_documents;

CREATE POLICY "Professionals can view assigned dispute documents"
ON public.dispute_documents
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- 3. Fix dispute_meetings table - professionals should only see meetings from their assigned disputes
DROP POLICY IF EXISTS "Professionals can view assigned dispute meetings" ON public.dispute_meetings;

CREATE POLICY "Professionals can view assigned dispute meetings"
ON public.dispute_meetings
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- 4. Fix case_updates table - add policy for professionals to view updates from their assigned disputes
CREATE POLICY "Professionals can view assigned case updates"
ON public.case_updates
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- 5. Restrict notifications INSERT to only service role (not anonymous users)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 6. Allow users to create their own profile during registration
CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);