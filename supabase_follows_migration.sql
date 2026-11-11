-- Ejecutar UNA VEZ en Supabase > SQL Editor (es seguro repetirlo).
-- Seguidores: una solicitud nace como 'pending' y pasa a 'accepted' cuando la
-- persona seguida la acepta. Al borrar un usuario se borran sus relaciones.

-- 1) Si la tabla ya existía de pruebas anteriores, se quitan filas que estorban:
--    huérfanas (usuario borrado), a uno mismo y duplicadas.
DO $$
BEGIN
    IF to_regclass('public.follows') IS NOT NULL THEN
        DELETE FROM public.follows f
        WHERE f.follower_id::text = f.following_id::text
           OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id::text = f.follower_id::text)
           OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id::text = f.following_id::text);

        DELETE FROM public.follows a
        USING public.follows b
        WHERE a.ctid < b.ctid
          AND a.follower_id::text  = b.follower_id::text
          AND a.following_id::text = b.following_id::text;
    END IF;
END $$;

-- 2) TABLA ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (follower_id <> following_id)
);

-- Una sola relación por pareja (A sigue a B)
CREATE UNIQUE INDEX IF NOT EXISTS follows_pair_unique
    ON public.follows (follower_id, following_id);

CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows (following_id);

-- 2b) Si la tabla ya existía con otra forma, se completan valores por defecto y
--     relaciones con users (si algo no aplica, se omite sin romper el script).
DO $$
DECLARE
    id_type TEXT;
BEGIN
    SELECT data_type INTO id_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'follows' AND column_name = 'id';

    BEGIN
        IF id_type = 'uuid' THEN
            ALTER TABLE public.follows ALTER COLUMN id SET DEFAULT gen_random_uuid();
        ELSE
            ALTER TABLE public.follows ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.follows ALTER COLUMN status SET DEFAULT 'pending';
        ALTER TABLE public.follows ALTER COLUMN created_at SET DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage k
          ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = 'follows'
          AND tc.constraint_type = 'FOREIGN KEY' AND k.column_name = 'follower_id'
    ) THEN
        BEGIN
            ALTER TABLE public.follows
                ADD CONSTRAINT follows_follower_fk
                FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage k
          ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = 'follows'
          AND tc.constraint_type = 'FOREIGN KEY' AND k.column_name = 'following_id'
    ) THEN
        BEGIN
            ALTER TABLE public.follows
                ADD CONSTRAINT follows_following_fk
                FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END IF;
END $$;

-- 3) PERMISOS (RLS abierto para desarrollo, como el resto del proyecto) ---------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follows TO anon, authenticated;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows lectura" ON public.follows;
CREATE POLICY "follows lectura" ON public.follows
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "follows alta" ON public.follows;
CREATE POLICY "follows alta" ON public.follows
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "follows cambio" ON public.follows;
CREATE POLICY "follows cambio" ON public.follows
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "follows baja" ON public.follows;
CREATE POLICY "follows baja" ON public.follows
    FOR DELETE TO anon, authenticated USING (true);

-- 4) REALTIME: para que la solicitud llegue al instante a la otra cuenta --------
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
