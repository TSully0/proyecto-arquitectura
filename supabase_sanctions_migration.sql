-- =============================================================================
-- Sanciones (baneo / suspensión), historial de moderación, notas del equipo y
-- actividad. Ejecutar UNA SOLA VEZ en Supabase > SQL Editor.
-- Es seguro repetirlo: usa IF NOT EXISTS / DROP POLICY IF EXISTS.
-- No toca la tabla reviews.
-- =============================================================================

-- 1) SANCIONES (una fila por usuario sancionado) ------------------------------
-- Va en una tabla aparte para poder activar Realtime sin exponer passwordHash.
CREATE TABLE IF NOT EXISTS public.user_sanctions (
    "userId"           UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    banned             BOOLEAN     NOT NULL DEFAULT FALSE,
    "suspendedUntil"   TIMESTAMPTZ,
    "sanctionReason"   TEXT        NOT NULL DEFAULT '',
    "sanctionCategory" TEXT        NOT NULL DEFAULT '',
    "suspensionLabel"  TEXT        NOT NULL DEFAULT '',
    "liftedNotice"     TEXT        CHECK ("liftedNotice" IN ('suspension', 'ban')),
    "liftedBy"         TEXT,
    "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) HISTORIAL DE MODERACIÓN ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action       TEXT NOT NULL,          -- ban, unban, suspend, unsuspend, review_delete, review_restore
    "actorId"    TEXT NOT NULL,
    "actorName"  TEXT NOT NULL DEFAULT 'Desconocido',
    "actorRole"  TEXT NOT NULL DEFAULT '',
    "targetId"   TEXT,
    "targetName" TEXT,
    reason       TEXT,
    duration     TEXT,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS moderation_log_created_idx ON public.moderation_log ("createdAt" DESC);

-- 3) NOTAS INTERNAS DEL EQUIPO -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_notes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"      TEXT NOT NULL,
    tag           TEXT,
    text          TEXT NOT NULL DEFAULT '',
    "authorId"    TEXT NOT NULL,
    "authorName"  TEXT NOT NULL DEFAULT 'Desconocido',
    "authorRole"  TEXT NOT NULL DEFAULT '',
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_notes_user_idx ON public.user_notes ("userId");

-- 4) ACTIVIDAD (publicaciones, comentarios, likes, seguidos...) ----------------
CREATE TABLE IF NOT EXISTS public.user_activity (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"     TEXT NOT NULL,
    type         TEXT NOT NULL,          -- post, comment, like, follow, moderation
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_activity_user_idx ON public.user_activity ("userId");

-- 5) PERMISOS Y RLS (igual de abiertos que el resto del proyecto) --------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.user_sanctions, public.moderation_log, public.user_notes, public.user_activity
TO anon, authenticated;

ALTER TABLE public.user_sanctions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sanctions_all" ON public.user_sanctions;
CREATE POLICY "sanctions_all" ON public.user_sanctions
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- El historial es un registro: se puede leer y agregar, no borrar ni editar.
DROP POLICY IF EXISTS "modlog_select" ON public.moderation_log;
CREATE POLICY "modlog_select" ON public.moderation_log
    FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "modlog_insert" ON public.moderation_log;
CREATE POLICY "modlog_insert" ON public.moderation_log
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "notes_all" ON public.user_notes;
CREATE POLICY "notes_all" ON public.user_notes
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "activity_all" ON public.user_activity;
CREATE POLICY "activity_all" ON public.user_activity
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6) QUE UN USUARIO SE PUEDA ACTUALIZAR EN users (rol, nombre, contraseña) -----
-- Si ya lo habías creado a mano, esto solo lo reemplaza por lo mismo.
GRANT UPDATE ON public.users TO anon, authenticated;
DROP POLICY IF EXISTS "Permitir actualizar usuarios" ON public.users;
CREATE POLICY "Permitir actualizar usuarios" ON public.users
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 7) REALTIME: para que un baneo o suspensión llegue al instante ---------------
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sanctions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_log;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 8) (Opcional) Cuentas de prueba que hoy solo existen en el navegador ---------
-- María Moderadora, Camila Ruiz, Pedro López... no están en Supabase, por eso
-- no se les puede sancionar ni se ven en otros navegadores. Para crearlas:
-- INSERT INTO public.users (email, "passwordHash", "fullName", role)
-- VALUES ('maria.mod@hotmail.com', 'cGFzc3dvcmQxMjM=', 'María Moderadora', 'MODERATOR')
-- ON CONFLICT (email) DO NOTHING;
-- (la contraseña es password123 codificada con btoa, igual que usa la app)
