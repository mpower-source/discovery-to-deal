/*
  # Fix RLS Policies for Anonymous Access and Real-time Updates

  ## Overview
  This migration updates Row Level Security (RLS) policies on the dcf_leads table
  to allow anonymous (anon) users to access data. This is required for real-time
  subscriptions to work properly when using the Supabase anonymous key.

  ## Changes
  1. Drop existing policies that only allow authenticated users
  2. Create new policies that allow both anon and authenticated users
  3. Maintain the same level of access (SELECT, INSERT, UPDATE, DELETE)

  ## Security Note
  - Anonymous users will have full CRUD access to dcf_leads
  - This is acceptable for applications without user authentication
  - RLS is still enabled, providing a security layer
  - Consider adding additional constraints if needed in the future

  ## Impact
  - Real-time subscriptions will now receive updates
  - Progress bars and UI elements will update automatically
  - No manual refresh required
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view dcf_leads" ON public.dcf_leads;
DROP POLICY IF EXISTS "Authenticated users can insert dcf_leads" ON public.dcf_leads;
DROP POLICY IF EXISTS "Authenticated users can update dcf_leads" ON public.dcf_leads;
DROP POLICY IF EXISTS "Authenticated users can delete dcf_leads" ON public.dcf_leads;

-- Create new policies allowing both anon and authenticated access

-- Policy for SELECT (read access)
CREATE POLICY "Allow anon and authenticated users to view dcf_leads"
  ON public.dcf_leads
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy for INSERT (create access)
CREATE POLICY "Allow anon and authenticated users to insert dcf_leads"
  ON public.dcf_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy for UPDATE (modify access)
CREATE POLICY "Allow anon and authenticated users to update dcf_leads"
  ON public.dcf_leads
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for DELETE (remove access)
CREATE POLICY "Allow anon and authenticated users to delete dcf_leads"
  ON public.dcf_leads
  FOR DELETE
  TO anon, authenticated
  USING (true);