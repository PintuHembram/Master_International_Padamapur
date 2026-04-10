
DROP POLICY "Admins can insert students" ON public.students;

CREATE POLICY "Anyone can insert students" ON public.students
FOR INSERT TO public
WITH CHECK (true);
