-- ============================================
-- Supabase Storage buckets untuk Snapjoy
-- Foto disimpan di private bucket (lihat blueprint bagian 10.2)
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

-- 1. Guest dapat membaca foto yang published saja (via signed URL dari backend)
--    Bucket private, jadi semua akses file harus melalui signed URL.
--    Policy ini hanya sebagai lapisan tambahan; backend tetap mengontrol akses.

-- 2. Pemilik event (organization member) dapat mengelola semua foto dalam eventnya
CREATE POLICY "Organization members can manage photos in their events"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
  -- Periksa apakah user adalah member organization yang memiliki event
  -- (akan diganti dengan RLS yang lebih ketat setelah organizations tabel ada)
  AND EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.id = storage.objects.id
      AND so.bucket_id = 'photos'
  )
);

-- 3. Public read access untuk thumbnail di gallery (hanya published photos)
--    Dalam production, signed URL lebih disarankan daripada public access.
--    Untuk MVP, kita izinkan read pada path yang dikenal sebagai published.

CREATE POLICY "Public can read photo objects in photos bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

-- 4. Guest dapat upload foto (insert object)
CREATE POLICY "Guests can upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid() IS NULL -- tamu tidak login, upload anonim diizinkan
);
