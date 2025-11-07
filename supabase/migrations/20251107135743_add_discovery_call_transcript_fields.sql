/*
  # Add Discovery Call Transcript Fields

  1. New Columns
    - `dc_call_transcript` (text) - Full transcript text of the discovery call
    - `dc_call_summary` (text) - AI-generated or manual summary of key points from call
    - `dc_call_transcript_url` (text) - Supabase Storage URL for the uploaded transcript file
  
  2. Important Notes
    - These fields enable storing actual discovery call insights
    - The transcript URL will be included in webhook payloads for proposal generation
    - Transcript files are stored with pattern: {lead_id}/{timestamp}-transcript.txt
    - Storage bucket setup must be done via Supabase dashboard
*/

-- Add transcript-related columns to dcf_leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'dc_call_transcript'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN dc_call_transcript text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'dc_call_summary'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN dc_call_summary text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dcf_leads' AND column_name = 'dc_call_transcript_url'
  ) THEN
    ALTER TABLE public.dcf_leads ADD COLUMN dc_call_transcript_url text;
  END IF;
END $$;