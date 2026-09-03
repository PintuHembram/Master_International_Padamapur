
CREATE TABLE public.staff (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  name text not null,
  designation text,
  department text,
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_read" ON public.staff FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'teacher')
);
CREATE POLICY "staff_write" ON public.staff FOR ALL TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal')
) WITH CHECK (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal')
);
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.attendance (
  id uuid primary key default gen_random_uuid(),
  person_type text not null default 'student',
  student_id uuid references public.students(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null default 'present',
  class text,
  section text,
  remarks text,
  marked_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  CONSTRAINT attendance_person_chk CHECK (
    (person_type = 'student' AND student_id IS NOT NULL AND staff_id IS NULL)
    OR (person_type = 'staff' AND staff_id IS NOT NULL AND student_id IS NULL)
  )
);
CREATE UNIQUE INDEX attendance_student_uniq ON public.attendance(student_id, attendance_date) WHERE student_id IS NOT NULL;
CREATE UNIQUE INDEX attendance_staff_uniq ON public.attendance(staff_id, attendance_date) WHERE staff_id IS NOT NULL;
CREATE INDEX attendance_date_idx ON public.attendance(attendance_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_read" ON public.attendance FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'teacher')
);
CREATE POLICY "attendance_write" ON public.attendance FOR ALL TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'teacher')
) WITH CHECK (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'teacher')
);
CREATE TRIGGER attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
