/*
  # Fix Function Search Path Security Issue

  1. Function Security
    - Recreate `set_updated_at` function with immutable search_path
    - Prevents search_path manipulation attacks by setting `search_path = ''`
    - Fully qualify all object references to work with empty search_path
  
  ## Changes
  
  ### Function Security Fix
  - Drop existing `set_updated_at` function
  - Recreate with `SET search_path = ''` to prevent role mutable search_path vulnerability
  - Use fully qualified function names (e.g., `pg_catalog.now()`)
  - Recreate any triggers that depend on this function
  
  ## Security Notes
  - Setting search_path to empty string prevents malicious users from injecting
    malicious functions into the search path that could be executed with elevated privileges
  - All object references must be fully qualified when search_path is empty
*/

-- Drop existing function (CASCADE removes dependent triggers)
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- Recreate function with secure search_path setting
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Use fully qualified function name since search_path is empty
  new.updated_at = pg_catalog.now();
  RETURN new;
END;
$$;

-- Recreate triggers for tables with updated_at column
-- This restores the triggers that were dropped by CASCADE
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Find all tables in public schema that have an updated_at column
  FOR r IN 
    SELECT DISTINCT table_name
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'updated_at'
  LOOP
    -- Drop trigger if exists (for idempotency)
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I',
      r.table_name
    );
    
    -- Create trigger
    EXECUTE format(
      'CREATE TRIGGER set_updated_at 
       BEFORE UPDATE ON public.%I 
       FOR EACH ROW 
       EXECUTE FUNCTION public.set_updated_at()',
      r.table_name
    );
  END LOOP;
END $$;
