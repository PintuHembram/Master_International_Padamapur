
CREATE TABLE public.student_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  exam_type TEXT NOT NULL DEFAULT 'Annual',
  academic_year TEXT NOT NULL DEFAULT '2024-25',
  rank INTEGER,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view results"
ON public.student_results
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage results"
ON public.student_results
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert results"
ON public.student_results
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update results"
ON public.student_results
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete results"
ON public.student_results
FOR DELETE
TO public
USING (true);

CREATE TRIGGER update_student_results_updated_at
BEFORE UPDATE ON public.student_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
