CREATE POLICY "Anyone can delete students"
ON public.students
FOR DELETE
TO public
USING (true);