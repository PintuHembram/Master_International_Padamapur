CREATE TABLE public.website_visit_counter (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  total_visits bigint NOT NULL DEFAULT 0 CHECK (total_visits >= 0)
);

ALTER TABLE public.website_visit_counter ENABLE ROW LEVEL SECURITY;

INSERT INTO public.website_visit_counter (id, total_visits)
VALUES (true, 0);

REVOKE ALL ON TABLE public.website_visit_counter FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_website_visit()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.website_visit_counter (id, total_visits)
  VALUES (true, 1)
  ON CONFLICT (id)
  DO UPDATE SET total_visits = public.website_visit_counter.total_visits + 1
  RETURNING total_visits;
$$;

REVOKE ALL ON FUNCTION public.record_website_visit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_website_visit() TO anon, authenticated;
