/*
  # Fix Function Search Path Security

  This migration addresses a critical security vulnerability in the `set_updated_at` function.

  ## Security Issue
  - The function `public.set_updated_at` has a role mutable search_path
  - This creates a vulnerability to search_path hijacking attacks
  - Malicious users could potentially inject malicious code through search_path manipulation

  ## Fix Applied
  - Recreate the `set_updated_at` function with an immutable search_path
  - Set `search_path = ''` to use only fully-qualified function names
  - Explicitly use `pg_catalog.now()` instead of `now()` to prevent hijacking
  - This ensures the function always uses the correct PostgreSQL catalog functions

  ## Impact
  - The function will continue to work exactly as before
  - Security is significantly improved
  - No changes needed to existing triggers or table structures
*/

-- Drop and recreate the function with secure search_path
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- Recreate with immutable search_path for security
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  new.updated_at = pg_catalog.now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (it was dropped by CASCADE above)
CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON public.dcf_leads
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();