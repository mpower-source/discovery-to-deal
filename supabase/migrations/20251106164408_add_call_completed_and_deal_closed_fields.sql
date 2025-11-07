/*
  # Add Discovery Call and Deal Closure Tracking Fields

  1. New Columns
    - `dc_call_completed` (boolean) - Manual flag to mark when discovery call actually happens
    - `deal_closed` (boolean) - Manual flag to mark when deal is closed/won
    - `closed_date` (timestamptz) - Date when the deal was closed
  
  2. Changes
    - Add dc_call_completed column with default false
    - Add deal_closed column with default false
    - Add closed_date column (nullable) for tracking closure date
  
  3. Purpose
    - Enable manual tracking of key sales milestones
    - Support the 7-stage Discovery to Deal journey visualization
    - Allow flexible workflow progression with manual checkpoints
*/

-- Add discovery call completed tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'dc_call_completed'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN dc_call_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add deal closed tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'deal_closed'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN deal_closed boolean DEFAULT false;
  END IF;
END $$;

-- Add closed date tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'closed_date'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN closed_date timestamptz;
  END IF;
END $$;
