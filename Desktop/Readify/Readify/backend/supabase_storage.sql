-- ============================================================
-- Readify LMS — Supabase Storage Setup
-- Creates storage buckets and policies for file uploads
-- ============================================================

-- Note: Storage bucket creation is done via the Supabase Dashboard
-- or via the Management API. The SQL below sets up the policies.
--
-- To create the bucket manually:
--   1. Go to Supabase Dashboard > Storage
--   2. Click "New Bucket"
--   3. Name: "resources"
--   4. Public: false (private bucket)
--   5. File size limit: 50MB
--   6. Allowed MIME types: application/pdf, image/*, video/*, application/zip

-- ============================================
-- Storage Policies for 'resources' bucket
-- ============================================

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "resources_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own files
CREATE POLICY "resources_read_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "resources_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow admins and teachers to read all files
CREATE POLICY "resources_read_teacher_admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resources'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );
