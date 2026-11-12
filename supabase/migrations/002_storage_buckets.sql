-- ==========================================--
-- Snapjoy Storage Buckets (Supabase Storage)
-- ============================================

-- Buat bucket 'photos' sebagai private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false, -- private bucket
  16777216, -- 16 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------
-- RLS policies untuk bucket 'photos'
-- -------------------------------------------

-- Pemilik event dapat mengelola foto dalam eventnya
CREATE POLICY "Event owners can manage photos in their events"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);

-- Publik dapat membaca foto (dengan signed URL dari backend)
CREATE POLICY "Public can read photo objects"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

-- Guest (tidak login) dapat upload foto
CREATE POLICY "Guests can upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
);
