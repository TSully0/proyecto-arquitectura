-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Las imagenes subidas se guardan en Storage; este registro conserva su URL
-- y la ruta del archivo para cada usuario de la aplicacion.

CREATE TABLE IF NOT EXISTS public.profile_photos (
    user_id TEXT PRIMARY KEY,
    photo_url TEXT NOT NULL,
    storage_path TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_photos TO anon, authenticated;

ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read profile photo records" ON public.profile_photos;
CREATE POLICY "Read profile photo records"
ON public.profile_photos FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Create profile photo records" ON public.profile_photos;
CREATE POLICY "Create profile photo records"
ON public.profile_photos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Update profile photo records" ON public.profile_photos;
CREATE POLICY "Update profile photo records"
ON public.profile_photos FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Delete profile photo records" ON public.profile_photos;
CREATE POLICY "Delete profile photo records"
ON public.profile_photos FOR DELETE
TO anon, authenticated
USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[]
)
ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read profile photos" ON storage.objects;
CREATE POLICY "Public read profile photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Upload profile photos" ON storage.objects;
CREATE POLICY "Upload profile photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Update profile photos" ON storage.objects;
CREATE POLICY "Update profile photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Delete profile photos" ON storage.objects;
CREATE POLICY "Delete profile photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'profile-photos');
