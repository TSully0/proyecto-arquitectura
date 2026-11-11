-- =====================================================================
-- CHAT EN SUPABASE (mensajes + adjuntos + tiempo real)
-- Se puede ejecutar varias veces sin problema.
-- No modifica ninguna tabla existente.
-- =====================================================================

-- 1) Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT        NOT NULL,
    sender_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    body            TEXT        NOT NULL DEFAULT '',
    image_url       TEXT,
    file_url        TEXT,
    file_name       TEXT,
    file_type       TEXT,
    file_size       BIGINT,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT messages_not_empty CHECK (
        length(btrim(body)) > 0 OR image_url IS NOT NULL OR file_url IS NOT NULL
    ),
    CONSTRAINT messages_body_len CHECK (length(body) <= 500)
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx
    ON public.messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS messages_receiver_idx
    ON public.messages (receiver_id, read_at);
CREATE INDEX IF NOT EXISTS messages_sender_idx
    ON public.messages (sender_id);

-- 2) Permisos (mismo esquema abierto que el resto del proyecto en desarrollo)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon, authenticated;

DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "messages_delete" ON public.messages;
CREATE POLICY "messages_delete" ON public.messages
    FOR DELETE TO anon, authenticated USING (true);

-- 3) Tiempo real: avisar a los navegadores cuando llega/cambia un mensaje
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END $$;

-- 4) Bucket para fotos, vídeos y documentos del chat
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-files', 'chat-files', TRUE, 10485760)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "Public read chat files" ON storage.objects;
CREATE POLICY "Public read chat files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'chat-files');

DROP POLICY IF EXISTS "Upload chat files" ON storage.objects;
CREATE POLICY "Upload chat files"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'chat-files');

DROP POLICY IF EXISTS "Delete chat files" ON storage.objects;
CREATE POLICY "Delete chat files"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'chat-files');
