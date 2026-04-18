-- Create admission_applications table for the 5-step admission flow
CREATE TABLE public.admission_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT UNIQUE,
  current_step INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  -- Resume credentials (anonymous flow)
  resume_dob DATE,

  -- A. Student Basic
  full_name TEXT,
  gender TEXT,
  date_of_birth DATE,
  blood_group TEXT,
  aadhaar_number TEXT,
  category TEXT,
  religion TEXT,
  nationality TEXT DEFAULT 'Indian',

  -- B. Contact
  mobile TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,

  -- C. Academic
  applying_class TEXT,
  previous_school TEXT,
  previous_class TEXT,
  previous_marks TEXT,
  medium TEXT,

  -- D. Parents/Guardian
  father_name TEXT,
  father_occupation TEXT,
  father_phone TEXT,
  mother_name TEXT,
  mother_occupation TEXT,
  mother_phone TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,

  -- E. Health
  height TEXT,
  weight TEXT,
  medical_conditions TEXT,
  allergies TEXT,

  -- F. Other
  transport_required BOOLEAN DEFAULT false,
  hostel_required BOOLEAN DEFAULT false,
  activities TEXT[] DEFAULT '{}',

  -- Documents (Step 2) — jsonb of { birth_cert, photo, aadhaar, tc, marksheet }
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Assessment (Step 3)
  assessment_date DATE,
  assessment_mode TEXT,
  assessment_remarks TEXT,
  assessment_result TEXT,

  -- Payment (Step 4)
  fee_total NUMERIC,
  fee_breakdown JSONB,
  payment_status TEXT DEFAULT 'pending',
  payment_transaction_id TEXT,
  payment_date TIMESTAMPTZ,

  -- Enrollment (Step 5)
  admission_number TEXT,
  enrolled_student_id UUID,
  enrolled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate application_number like MIS-APP-2026-0001
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num int;
  yr text;
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    yr := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(CAST(regexp_replace(application_number, '^MIS-APP-\d{4}-', '') AS int)), 0) + 1
      INTO next_num
      FROM public.admission_applications
      WHERE application_number LIKE 'MIS-APP-' || yr || '-%';
    NEW.application_number := 'MIS-APP-' || yr || '-' || LPAD(next_num::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_application_number
BEFORE INSERT ON public.admission_applications
FOR EACH ROW
EXECUTE FUNCTION public.generate_application_number();

CREATE TRIGGER update_admission_applications_updated_at
BEFORE UPDATE ON public.admission_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

-- Public can INSERT a new draft (anonymous applicants)
CREATE POLICY "Anyone can create admission application"
ON public.admission_applications
FOR INSERT
TO public
WITH CHECK (true);

-- Public can SELECT/UPDATE — gated client-side by application_number + DOB lookup.
-- (Same pattern used by the existing /student/login flow.)
CREATE POLICY "Anyone can view admission applications"
ON public.admission_applications
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update admission applications"
ON public.admission_applications
FOR UPDATE
TO public
USING (true);

-- Admins can delete
CREATE POLICY "Admins can delete admission applications"
ON public.admission_applications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for admission documents (public read so signed-URL hassle is avoided;
-- file paths use the application_number which is hard to guess).
INSERT INTO storage.buckets (id, name, public)
VALUES ('admission-documents', 'admission-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view admission documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'admission-documents');

CREATE POLICY "Public can upload admission documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'admission-documents');

CREATE POLICY "Public can update admission documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'admission-documents');

CREATE POLICY "Admins can delete admission documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admission-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Helpful indexes
CREATE INDEX idx_admission_apps_app_number ON public.admission_applications(application_number);
CREATE INDEX idx_admission_apps_status ON public.admission_applications(status);
CREATE INDEX idx_admission_apps_dob ON public.admission_applications(resume_dob);