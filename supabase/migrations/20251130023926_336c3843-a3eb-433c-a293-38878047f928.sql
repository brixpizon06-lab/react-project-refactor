-- Add password field to students table for temporary login credentials
-- NOTE: This is a temporary solution. For production, implement proper Supabase Auth
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS password text;