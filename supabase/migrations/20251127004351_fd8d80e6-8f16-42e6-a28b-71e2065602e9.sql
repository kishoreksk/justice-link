-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for case documents bucket
CREATE POLICY "Users can view their case documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'case-documents' AND
  (
    -- User is the dispute owner
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM disputes WHERE user_id = auth.uid()
    )
    OR
    -- User is admin
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- User is assigned professional
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM disputes 
      WHERE assigned_professional_id IN (
        SELECT id FROM professionals WHERE id IN (
          SELECT assigned_professional_id FROM disputes WHERE id::text = (storage.foldername(name))[1]
        )
      )
    )
  )
);

CREATE POLICY "Admins can upload case documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create table for tracking meeting history
CREATE TABLE IF NOT EXISTS public.dispute_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on dispute_meetings
ALTER TABLE public.dispute_meetings ENABLE ROW LEVEL SECURITY;

-- RLS policies for dispute_meetings
CREATE POLICY "Users can view own dispute meetings"
ON public.dispute_meetings FOR SELECT
USING (
  dispute_id IN (SELECT id FROM disputes WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all dispute meetings"
ON public.dispute_meetings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Professionals can view assigned dispute meetings"
ON public.dispute_meetings FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals
    )
  )
);

CREATE POLICY "Admins can insert dispute meetings"
ON public.dispute_meetings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create table for tracking document submissions
CREATE TABLE IF NOT EXISTS public.dispute_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by TEXT NOT NULL, -- 'applicant' or 'respondent'
  document_name TEXT NOT NULL,
  document_description TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on dispute_documents
ALTER TABLE public.dispute_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for dispute_documents
CREATE POLICY "Users can view own dispute documents"
ON public.dispute_documents FOR SELECT
USING (
  dispute_id IN (SELECT id FROM disputes WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all dispute documents"
ON public.dispute_documents FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Professionals can view assigned dispute documents"
ON public.dispute_documents FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE assigned_professional_id IN (
      SELECT id FROM professionals
    )
  )
);

CREATE POLICY "Admins can insert dispute documents"
ON public.dispute_documents FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add advocate details to disputes table
ALTER TABLE public.disputes 
ADD COLUMN IF NOT EXISTS applicant_advocate_name TEXT,
ADD COLUMN IF NOT EXISTS applicant_advocate_phone TEXT,
ADD COLUMN IF NOT EXISTS respondent_advocate_name TEXT,
ADD COLUMN IF NOT EXISTS respondent_advocate_phone TEXT,
ADD COLUMN IF NOT EXISTS award_pdf_url TEXT;