DROP POLICY IF EXISTS "Anyone can view fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Anyone can insert fee payment" ON public.fee_payments;

CREATE POLICY "Anyone can record a fee payment" ON public.fee_payments
  FOR INSERT WITH CHECK (true);