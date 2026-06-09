-- Create media storage bucket (public read, authenticated upload/delete)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all files
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');
