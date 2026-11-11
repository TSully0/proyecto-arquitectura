-- =====================================================================
-- CHAT: eliminar solo para mí (como Instagram / WhatsApp)
-- Ejecutar DESPUÉS de supabase_chat_migration.sql. Se puede repetir.
-- =====================================================================

-- 1) "Eliminar para mí" de un mensaje: guarda quién lo ocultó
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS deleted_for UUID[] NOT NULL DEFAULT '{}';

-- 2) "Eliminar chat" para mí: desde cleared_at no veo lo anterior.
CREATE TABLE IF NOT EXISTS public.chat_state (
    user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    peer_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    cleared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, peer_id)
);

ALTER TABLE public.chat_state ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_state TO anon, authenticated;

DROP POLICY IF EXISTS "chat_state_select" ON public.chat_state;
CREATE POLICY "chat_state_select" ON public.chat_state
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "chat_state_insert" ON public.chat_state;
CREATE POLICY "chat_state_insert" ON public.chat_state
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_state_update" ON public.chat_state;
CREATE POLICY "chat_state_update" ON public.chat_state
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "chat_state_delete" ON public.chat_state;
CREATE POLICY "chat_state_delete" ON public.chat_state
    FOR DELETE TO anon, authenticated USING (true);
