-- Expand students table with full profile fields
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS admission_date date,
  ADD COLUMN IF NOT EXISTS session text DEFAULT '2025-26',
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS father_phone text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS mother_phone text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS height text,
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS medical_conditions text,
  ADD COLUMN IF NOT EXISTS allergies text,
  ADD COLUMN IF NOT EXISTS documents_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Auto-generate student_id like MIS-2025-0001 when missing
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num int;
  yr text;
BEGIN
  IF NEW.student_id IS NULL OR NEW.student_id = '' THEN
    yr := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(CAST(regexp_replace(student_id, '^MIS-\d{4}-', '') AS int)), 0) + 1
      INTO next_num
      FROM public.students
      WHERE student_id LIKE 'MIS-' || yr || '-%';
    NEW.student_id := 'MIS-' || yr || '-' || LPAD(next_num::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_student_id ON public.students;
CREATE TRIGGER trg_generate_student_id
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_student_id();

-- Updated-at trigger
DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tighten RLS: remove the dangerous "Anyone can delete/insert students" public policies
DROP POLICY IF EXISTS "Anyone can delete students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;

-- Recreate insert policy as admin-only
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
CREATE POLICY "Admins can insert students"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));