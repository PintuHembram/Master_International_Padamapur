CREATE POLICY "Anyone can insert exam subjects"
ON public.exam_subjects
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can delete exam subjects"
ON public.exam_subjects
FOR DELETE
TO public
USING (true);

CREATE POLICY "Anyone can update exam subjects"
ON public.exam_subjects
FOR UPDATE
TO public
USING (true);