
CREATE TABLE public.mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  total_marks INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.mock_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq',
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option TEXT NOT NULL,
  marks INT NOT NULL DEFAULT 1,
  difficulty TEXT DEFAULT 'medium',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.mock_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  student_roll TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);

ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;

-- mock_tests
CREATE POLICY "Anyone can view active tests" ON public.mock_tests FOR SELECT USING (true);
CREATE POLICY "Admins manage tests" ON public.mock_tests FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- mock_questions
CREATE POLICY "Anyone can view questions" ON public.mock_questions FOR SELECT USING (true);
CREATE POLICY "Admins manage questions" ON public.mock_questions FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- mock_attempts
CREATE POLICY "Anyone can insert attempt" ON public.mock_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view attempts" ON public.mock_attempts FOR SELECT USING (true);
CREATE POLICY "Anyone can update attempt" ON public.mock_attempts FOR UPDATE USING (true);
CREATE POLICY "Admins delete attempts" ON public.mock_attempts FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER update_mock_tests_updated_at BEFORE UPDATE ON public.mock_tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
