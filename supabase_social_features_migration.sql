-- =============================================================================
-- MIGRACIÓN DE CONEXIÓN A BASE DE DATOS: NOTIFICACIONES, COMPARTIR Y LUGARES REALES
-- Proyecto: Huecas Manabas – MantaCampus
-- Instrucciones: Ejecutar en Supabase Dashboard > SQL Editor > New query > Run.
-- =============================================================================

-- 1. TABLA: notifications (Notificaciones reales sincronizadas en BD)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon, authenticated;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura de notificaciones" ON public.notifications;
CREATE POLICY "Permitir lectura de notificaciones" ON public.notifications
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir insercion de notificaciones" ON public.notifications;
CREATE POLICY "Permitir insercion de notificaciones" ON public.notifications
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de notificaciones" ON public.notifications;
CREATE POLICY "Permitir actualizacion de notificaciones" ON public.notifications
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion de notificaciones" ON public.notifications;
CREATE POLICY "Permitir eliminacion de notificaciones" ON public.notifications
    FOR DELETE TO anon, authenticated USING (true);


-- 2. TABLA: place_shares (Registro de publicaciones y lugares compartidos)
CREATE TABLE IF NOT EXISTS public.place_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL,
    post_id TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.place_shares TO anon, authenticated;
ALTER TABLE public.place_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura de compartidos" ON public.place_shares;
CREATE POLICY "Permitir lectura de compartidos" ON public.place_shares
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir insercion de compartidos" ON public.place_shares;
CREATE POLICY "Permitir insercion de compartidos" ON public.place_shares
    FOR INSERT TO anon, authenticated WITH CHECK (true);


-- 3. ACTUALIZACIÓN DE LUGARES REALES DE MANTA, MANABÍ
-- Reemplaza los datos de prueba o genéricos con los lugares auténticos de Manta:
UPDATE public.places
SET 
    name = 'Cinemark Manta - Mall del Pacífico',
    description = 'Modernas salas XD y 2D/3D en Mall del Pacífico frente a la playa El Murciélago. Descuentos estudiantiles con carnet de la ULEAM todos los martes y miércoles.',
    address = 'Mall del Pacífico, Av. Malecón y Calle 23, Manta',
    images = ARRAY['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80']
WHERE id = 'b1111111-0000-0000-0000-000000000001';

UPDATE public.places
SET 
    name = 'Cevichería El Chaval - Tarqui',
    description = 'Auténticos ceviches manabitas de pescado, camarón y concha con maní y chifles en la zona pesquera de Tarqui. Platos típicos a precios universitarios.',
    address = 'Playita Mía / Tarqui, Malecón frente al puerto pesquero, Manta',
    images = ARRAY['https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80']
WHERE id = 'b1111111-0000-0000-0000-000000000002';

UPDATE public.places
SET 
    name = 'Playa El Murciélago - Surf & Malecón',
    description = 'La playa más emblemática de Manta. Olas constantes para surfistas novatos y avanzados, malecón escénico con restaurantes y ambiente universitario.',
    address = 'Malecón Escénico, Playa El Murciélago, Manta',
    images = ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80']
WHERE id = 'b1111111-0000-0000-0000-000000000003';

UPDATE public.places
SET 
    name = 'Museo Centro Cultural Manta & MAAC Cine',
    description = 'Espacio cultural y arqueológico frente al mar. Alberga la colección de la cultura Manteña, sillas de piedra manteñas y proyecciones de cine independiente.',
    address = 'Av. Malecón Jaime Chávez Gutiérrez y Calle 20, Manta',
    images = ARRAY['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80']
WHERE id = 'b1111111-0000-0000-0000-000000000004';

UPDATE public.places
SET 
    name = 'Playa Santa Marianita - Capital del Kitesurf',
    description = 'Playa tranquila a 15 minutos de Manta, famosa a nivel internacional por sus vientos constantes ideales para kitesurf y atardeceres mágicos.',
    address = 'Costanera Sur, Santa Marianita, Manta',
    images = ARRAY['https://images.unsplash.com/photo-1510414842594-a61752afb394?auto=format&fit=crop&w=800&q=80']
WHERE id = 'b1111111-0000-0000-0000-000000000005';

UPDATE public.places
SET 
    name = 'Refugio de Vida Silvestre Pacoche',
    description = 'Microclima húmedo y bosque tropical a minutos de Manta. Senderismo guiado para avistamiento de monos aulladores, flora nativa y cascadas.',
    address = 'Parroquia San Lorenzo - Pacoche, Manta',
    images = ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80']
WHERE id = 'b1111111-0000-0000-0000-000000000006';

-- 4. NOTIFICACIONES INICIALES EN BD
INSERT INTO public.notifications (user_id, title, description, type, is_read)
VALUES
    ('all', 'Beneficio Estudiantil ULEAM', '20% de descuento en Cinemark Manta (Mall del Pacífico) presentando carnet universitario.', 'discount', false),
    ('all', 'Nueva Recomendación en Tarqui', 'Comunidad recomendó los ceviches con maní de Cevichería El Chaval frente al puerto pesquero.', 'review', false)
ON CONFLICT DO NOTHING;
