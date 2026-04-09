
CREATE TABLE public.fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  roll_number TEXT,
  father_name TEXT,
  fee_category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'cash',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  academic_year TEXT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert fee payment" ON public.fee_payments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view fee payments" ON public.fee_payments FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage fee payments" ON public.fee_payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
