-- SCHOOLS
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  school_code text,
  udise_code text,
  board text,
  category text,
  school_type text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  website text,
  principal_name text,
  logo_url text,
  current_academic_year text NOT NULL DEFAULT '2025-26',
  is_active boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage schools" ON public.schools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ACADEMIC YEARS
CREATE TABLE public.academic_years (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year_label text NOT NULL UNIQUE,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT ALL ON public.academic_years TO service_role;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage academic years" ON public.academic_years FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER academic_years_updated_at BEFORE UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  user_email text,
  action text NOT NULL,
  module text,
  record_id text,
  description text,
  severity text NOT NULL DEFAULT 'info',
  ip_address text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated write audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

-- IP ALLOWLIST
CREATE TABLE public.ip_allowlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  ip_address text NOT NULL,
  scope text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_allowlist TO authenticated;
GRANT ALL ON public.ip_allowlist TO service_role;
ALTER TABLE public.ip_allowlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ip allowlist" ON public.ip_allowlist FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER ip_allowlist_updated_at BEFORE UPDATE ON public.ip_allowlist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SECURITY SETTINGS (single row)
CREATE TABLE public.security_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  require_mfa_admins boolean NOT NULL DEFAULT false,
  require_mfa_all boolean NOT NULL DEFAULT false,
  captcha_public_forms boolean NOT NULL DEFAULT true,
  enforce_ip_allowlist boolean NOT NULL DEFAULT false,
  session_timeout_minutes integer NOT NULL DEFAULT 60,
  password_min_length integer NOT NULL DEFAULT 8,
  password_require_symbols boolean NOT NULL DEFAULT true,
  leaked_password_protection boolean NOT NULL DEFAULT true,
  max_login_attempts integer NOT NULL DEFAULT 5,
  audit_retention_days integer NOT NULL DEFAULT 365,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage security settings" ON public.security_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER security_settings_updated_at BEFORE UPDATE ON public.security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.security_settings (id) VALUES (gen_random_uuid());
INSERT INTO public.schools (name, school_code, udise_code, board, category, school_type, city, state, current_academic_year, is_primary)
VALUES ('Master International School', 'MIS', '21061400252', 'CBSE', 'Primary with Upper Primary', 'Co-educational', 'Padamapur', 'Odisha', '2025-26', true);
INSERT INTO public.academic_years (year_label, start_date, end_date, is_current) VALUES
  ('2024-25', '2024-04-01', '2025-03-31', false),
  ('2025-26', '2025-04-01', '2026-03-31', true),
  ('2026-27', '2026-04-01', '2027-03-31', false);