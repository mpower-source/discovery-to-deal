/*
  # Astra Lead Engine - DCF Leads Management Schema

  1. New Tables
    - `dcf_leads`
      - `lead_id` (uuid, primary key) - Unique identifier for each lead
      - `created_at` (timestamptz) - Lead creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      
      ## Essential Fields
      - `contact_name` (text, required) - Contact person's full name
      - `contact_linkedin` (text, required) - Contact person's LinkedIn URL
      - `contact_email` (text, required) - Contact person's email address
      - `contact_phone` (text, required) - Contact person's phone number
      - `company_name` (text, required) - Company name
      
      ## Optional Fields
      - `company_linkedin` (text) - Company LinkedIn URL
      - `company_website` (text) - Company website URL
      
      ## Enriched Data (populated by n8n)
      - `contact_linkedin_raw` (jsonb) - Raw LinkedIn profile data
      - `company_linkedin_raw` (jsonb) - Raw company LinkedIn data
      - `company_website_text` (text) - Scraped website content
      
      ## Lead Magnet Workflow Checkpoints (6 steps)
      - `lm_started` (boolean) - Workflow initiated
      - `lm_contact_profile_scraped` (boolean) - Contact LinkedIn scraped
      - `lm_company_profile_scraped` (boolean) - Company LinkedIn scraped
      - `lm_website_scraped` (boolean) - Website content scraped
      - `lm_brief_generated` (boolean) - Brief document generated
      - `lm_doc_uploaded` (boolean) - Document uploaded
      - `lm_doc_url` (text) - URL to lead magnet document
      
      ## Discovery Call Framework Checkpoints (3 steps)
      - `dc_started` (boolean) - Workflow initiated
      - `dc_generated` (boolean) - Framework generated
      - `dc_doc_uploaded` (boolean) - Document uploaded
      - `dc_doc_url` (text) - URL to discovery call document
      
      ## Proposal Checkpoints (3 steps)
      - `pr_started` (boolean) - Workflow initiated
      - `pr_generated` (boolean) - Proposal generated
      - `pr_doc_uploaded` (boolean) - Document uploaded
      - `pr_doc_url` (text) - URL to proposal document
      
      ## Error Tracking
      - `last_error` (text) - Last error message if any
  
  2. Security
    - Enable RLS on `dcf_leads` table
    - Add policies for authenticated users to manage dcf_leads
  
  3. Triggers
    - Auto-update `updated_at` timestamp on row modifications
  
  ## Important Notes
  - All workflow checkpoints default to false
  - n8n workflows receive only { lead_id } and update the row with progress
  - Document URLs are populated by n8n workflows
  - `updated_at` triggers realtime subscriptions for live progress updates
*/

-- Create dcf_leads table
CREATE TABLE IF NOT EXISTS public.dcf_leads (
  lead_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Essential fields
  contact_name text NOT NULL,
  contact_linkedin text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  company_name text NOT NULL,

  -- Optional fields
  company_linkedin text,
  company_website text,

  -- Enriched by n8n
  contact_linkedin_raw jsonb,
  company_linkedin_raw jsonb,
  company_website_text text,

  -- Lead Magnet checkpoints
  lm_started boolean DEFAULT false,
  lm_contact_profile_scraped boolean DEFAULT false,
  lm_company_profile_scraped boolean DEFAULT false,
  lm_website_scraped boolean DEFAULT false,
  lm_brief_generated boolean DEFAULT false,
  lm_doc_uploaded boolean DEFAULT false,
  lm_doc_url text,

  -- Discovery Call Framework checkpoints
  dc_started boolean DEFAULT false,
  dc_generated boolean DEFAULT false,
  dc_doc_uploaded boolean DEFAULT false,
  dc_doc_url text,

  -- Proposal checkpoints
  pr_started boolean DEFAULT false,
  pr_generated boolean DEFAULT false,
  pr_doc_uploaded boolean DEFAULT false,
  pr_doc_url text,

  last_error text
);

-- Enable RLS
ALTER TABLE public.dcf_leads ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view all dcf_leads
CREATE POLICY "Authenticated users can view dcf_leads"
  ON public.dcf_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert dcf_leads
CREATE POLICY "Authenticated users can insert dcf_leads"
  ON public.dcf_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update dcf_leads
CREATE POLICY "Authenticated users can update dcf_leads"
  ON public.dcf_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete dcf_leads
CREATE POLICY "Authenticated users can delete dcf_leads"
  ON public.dcf_leads
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.dcf_leads;
CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON public.dcf_leads
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();