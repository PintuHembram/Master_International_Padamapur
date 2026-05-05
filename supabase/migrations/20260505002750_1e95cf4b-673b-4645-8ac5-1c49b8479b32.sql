DROP POLICY IF EXISTS "Admins manage tests" ON public.mock_tests;
CREATE POLICY "Admins or teachers manage tests" ON public.mock_tests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

DROP POLICY IF EXISTS "Admins manage questions" ON public.mock_questions;
CREATE POLICY "Admins or teachers manage questions" ON public.mock_questions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));