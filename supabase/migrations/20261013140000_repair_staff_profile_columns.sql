ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS joining_year integer,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS assigned_class text;

NOTIFY pgrst, 'reload schema';
