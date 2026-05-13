
-- Phase 0: ERP foundation
-- Extend app_role enum with new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'principal';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warden';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'transport_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';
