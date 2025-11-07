/*
  # Add Storage Policies for DCF Transcript Bucket

  1. Storage Policies
    - Allow public uploads to dcf_transcript bucket
    - Allow public reads from dcf_transcript bucket
    - Allow public updates to dcf_transcript bucket (for re-uploads)
    - Allow public deletes from dcf_transcript bucket
  
  2. Important Notes
    - These policies enable file upload functionality for discovery call transcripts
    - Public access is granted to allow users to upload and view transcripts
    - The bucket must be created in Supabase dashboard before these policies work
*/

-- Policy for public uploads to dcf_transcript bucket
DROP POLICY IF EXISTS "Public can upload transcripts" ON storage.objects;
CREATE POLICY "Public can upload transcripts"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'dcf_transcript');

-- Policy for public reads from dcf_transcript bucket
DROP POLICY IF EXISTS "Public can read transcripts" ON storage.objects;
CREATE POLICY "Public can read transcripts"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'dcf_transcript');

-- Policy for public updates to dcf_transcript bucket (for re-uploads)
DROP POLICY IF EXISTS "Public can update transcripts" ON storage.objects;
CREATE POLICY "Public can update transcripts"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'dcf_transcript')
  WITH CHECK (bucket_id = 'dcf_transcript');

-- Policy for public deletes from dcf_transcript bucket
DROP POLICY IF EXISTS "Public can delete transcripts" ON storage.objects;
CREATE POLICY "Public can delete transcripts"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'dcf_transcript');