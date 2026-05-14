ALTER TABLE public.student_results ADD COLUMN IF NOT EXISTS date_of_birth date;
CREATE INDEX IF NOT EXISTS idx_student_results_roll ON public.student_results(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_results_class ON public.student_results(class);