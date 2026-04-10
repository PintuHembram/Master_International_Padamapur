
-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  photo_url TEXT,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students are viewable by everyone" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update students" ON public.students FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete students" ON public.students FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exams are viewable by everyone" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Admins can insert exams" ON public.exams FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update exams" ON public.exams FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete exams" ON public.exams FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Exam subjects table
CREATE TABLE public.exam_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  exam_time TEXT NOT NULL DEFAULT '10:00 AM - 1:00 PM',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exam subjects are viewable by everyone" ON public.exam_subjects FOR SELECT USING (true);
CREATE POLICY "Admins can insert exam subjects" ON public.exam_subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update exam subjects" ON public.exam_subjects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete exam subjects" ON public.exam_subjects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample exams
INSERT INTO public.exams (name, academic_year) VALUES
  ('Semester 1', '2025-26'),
  ('Semester 2', '2025-26'),
  ('Semester 3', '2025-26');

-- Insert sample students
INSERT INTO public.students (roll_number, name, class, section, date_of_birth) VALUES
  ('MIS-001', 'Aarav Sharma', 'VIII', 'A', '2012-03-15'),
  ('MIS-002', 'Priya Patel', 'VIII', 'A', '2012-07-22'),
  ('MIS-003', 'Rohan Das', 'VII', 'B', '2013-01-10'),
  ('MIS-004', 'Ananya Mishra', 'VI', 'A', '2014-05-18'),
  ('MIS-005', 'Vikram Singh', 'VII', 'A', '2013-09-03');
