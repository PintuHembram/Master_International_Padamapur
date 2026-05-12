
DROP POLICY IF EXISTS "Anyone can insert results" ON public.student_results;
DROP POLICY IF EXISTS "Anyone can update results" ON public.student_results;
DROP POLICY IF EXISTS "Anyone can delete results" ON public.student_results;

DROP POLICY IF EXISTS "Anyone can insert exam subjects" ON public.exam_subjects;
DROP POLICY IF EXISTS "Anyone can update exam subjects" ON public.exam_subjects;
DROP POLICY IF EXISTS "Anyone can delete exam subjects" ON public.exam_subjects;

DROP POLICY IF EXISTS "Anyone can update admission documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete admission documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can update admission documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete admission documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update admission documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete admission documents" ON storage.objects;

CREATE POLICY "Admins can update admission documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'admission-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admission documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'admission-documents' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can view questions" ON public.mock_questions;

DROP VIEW IF EXISTS public.mock_questions_public;
CREATE VIEW public.mock_questions_public AS
  SELECT id, test_id, question_text, question_type,
         option_a, option_b, option_c, option_d,
         marks, position, difficulty, created_at
  FROM public.mock_questions;

GRANT SELECT ON public.mock_questions_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_mock_attempt(
  p_test_id uuid,
  p_student_roll text,
  p_student_name text,
  p_student_class text,
  p_answers jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score int := 0;
  v_total int := 0;
  v_pct numeric := 0;
  v_id uuid;
  r record;
  v_ans text;
BEGIN
  IF p_test_id IS NULL OR p_student_roll IS NULL OR p_student_roll = '' THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;

  FOR r IN SELECT id, marks, correct_option FROM public.mock_questions WHERE test_id = p_test_id
  LOOP
    v_total := v_total + COALESCE(r.marks, 1);
    v_ans := lower(trim(COALESCE(p_answers ->> r.id::text, '')));
    IF v_ans <> '' AND v_ans = lower(trim(COALESCE(r.correct_option, ''))) THEN
      v_score := v_score + COALESCE(r.marks, 1);
    END IF;
  END LOOP;

  IF v_total > 0 THEN
    v_pct := round((v_score::numeric / v_total::numeric) * 100, 2);
  END IF;

  INSERT INTO public.mock_attempts (test_id, student_roll, student_name, student_class, answers, score, total, percentage, submitted_at)
  VALUES (p_test_id, p_student_roll, p_student_name, p_student_class, p_answers, v_score, v_total, v_pct, now())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_mock_attempt(uuid, text, text, text, jsonb) TO anon, authenticated;
