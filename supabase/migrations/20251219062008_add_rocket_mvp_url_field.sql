/*
  # Add Rocket MVP URL Field

  ## Overview
  This migration adds a new field to store the company's Rocket MVP URL.

  ## Changes Made
  1. New Column
    - `rocket_mvp_url` (text, optional) - URL to the company's Rocket MVP

  ## Purpose
  - Allows tracking of each lead's Rocket MVP link
  - Displayed in the company section alongside website and LinkedIn
  - Editable through the lead detail modal

  ## Security
  - No RLS changes needed (inherits existing table policies)
*/

-- Add rocket_mvp_url field to dcf_leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'rocket_mvp_url'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN rocket_mvp_url text;
  END IF;
END $$;