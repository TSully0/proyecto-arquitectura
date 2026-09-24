-- =============================================================================
-- SCRIPT SQL: MantaCampus Database Schema & Row Level Security (RLS)
-- Basado fielmente en la especificación del documento de arquitectura del proyecto
-- Compatible con PostgreSQL y Supabase
-- =============================================================================

-- 1. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUMERADOS (Según especificación del documento)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE "Role" AS ENUM ('STUDENT', 'MODERATOR', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricerange') THEN
        CREATE TYPE "PriceRange" AS ENUM ('CHEAP', 'MODERATE', 'EXPENSIVE');
    END IF;
END $$;

-- 3. TABLA DE USUARIOS (Gestionado por Backend 1)
-- Model User: id, email, passwordHash, fullName, role, isActive
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    role "Role" DEFAULT 'STUDENT'::"Role" NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA DE CATEGORÍAS (Gestionado por Backend 2)
-- Model Category: id, name, slug
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- ej: "Cines", "Comida", "Deportes Extremos"
    slug TEXT UNIQUE NOT NULL, -- ej: "cines", "deportes-extremos"
    icon TEXT,                 -- Icono para representación visual en frontend
    "displayOrder" INT DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLA DE LUGARES (Gestionado por Backend 2)
-- Model Place: id, name, description, address, latitude, longitude, openingHours,
-- priceRange, hasStudentDiscount, isStudyFriendly, images, categoryId, authorId, createdAt
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    "openingHours" TEXT,
    "priceRange" "PriceRange" DEFAULT 'MODERATE'::"PriceRange" NOT NULL,
    "hasStudentDiscount" BOOLEAN DEFAULT FALSE NOT NULL,
    "isStudyFriendly" BOOLEAN DEFAULT FALSE NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "categoryId" UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    "authorId" UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Moderador que lo creó
    
    -- Campos de soporte visual para la interfaz
    "hasWifi" BOOLEAN DEFAULT TRUE,
    "isOpen" BOOLEAN DEFAULT TRUE,
    "isPetFriendly" BOOLEAN DEFAULT FALSE,
    "isAccessible" BOOLEAN DEFAULT FALSE,
    "isNightSpot" BOOLEAN DEFAULT FALSE,
    "averageRating" NUMERIC(2,1) DEFAULT 5.0,
    "totalReviews" INT DEFAULT 0,

    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABLA DE RESEÑAS Y COMENTARIOS (Gestionado por Backend 2)
-- Model Review: id, rating (1 al 5), comment, userId, placeId, createdAt
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
    "placeId" UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    "authorName" TEXT DEFAULT 'Estudiante Manta',
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABLA DE LUGARES FAVORITOS (Relación UserFavorites)
-- favoritePlaces Place[] @relation("UserFavorites")
CREATE TABLE IF NOT EXISTS public.user_favorites (
    "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "placeId" UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY ("userId", "placeId")
);

-- 8. TABLA DE LIKES (Interacción social en tiempo real)
CREATE TABLE IF NOT EXISTS public.place_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "placeId" UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    "clientId" TEXT NOT NULL, -- Identificador de usuario o dispositivo
    "createdAt" TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE("placeId", "clientId")
);

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- =============================================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_likes ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para Users (Lectura controlada, login no afectado)
CREATE POLICY "Permitir lectura publica de usuarios" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Permitir registro de usuarios" 
ON public.users FOR INSERT 
WITH CHECK (true);

-- 2. Políticas para Categories (Lectura pública para catálogo)
CREATE POLICY "Permitir lectura publica de categorias" 
ON public.categories FOR SELECT 
USING (true);

-- 3. Políticas para Places (Catálogo público y creación)
CREATE POLICY "Permitir lectura publica de lugares" 
ON public.places FOR SELECT 
USING (true);

CREATE POLICY "Permitir crear lugares" 
ON public.places FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualizar lugares" 
ON public.places FOR UPDATE 
USING (true);

-- 4. Políticas para Reviews (Lectura pública y publicación con botón + Crea Review)
CREATE POLICY "Permitir lectura publica de resenas" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Permitir insertar resenas" 
ON public.reviews FOR INSERT 
WITH CHECK (true);

-- 5. Políticas para UserFavorites
CREATE POLICY "Permitir ver favoritos" 
ON public.user_favorites FOR SELECT 
USING (true);

CREATE POLICY "Permitir agregar favorito" 
ON public.user_favorites FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir eliminar favorito" 
ON public.user_favorites FOR DELETE 
USING (true);

-- 6. Políticas para PlaceLikes
CREATE POLICY "Permitir ver likes" 
ON public.place_likes FOR SELECT 
USING (true);

CREATE POLICY "Permitir dar like" 
ON public.place_likes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir quitar like" 
ON public.place_likes FOR DELETE 
USING (true);

-- =============================================================================
-- DATOS SEMILLA (SEED DATA)
-- Compatible con los endpoints y modelos del documento
-- =============================================================================

-- 1. Usuario Moderador Semilla (Ana G.)
INSERT INTO public.users (id, email, "passwordHash", "fullName", role, "isActive")
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'estudiante@uleam.edu.ec',
    '$2b$10$hashedpasswordforexample123',
    'Ana G.',
    'STUDENT',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 2. Categorías Semilla
INSERT INTO public.categories (id, name, slug, icon, "displayOrder")
VALUES 
    ('c1111111-0000-0000-0000-000000000001', 'Cines', 'cines', 'clapperboard', 1),
    ('c1111111-0000-0000-0000-000000000003', 'Comida', 'comida', 'utensils-crossed', 2),
    ('c1111111-0000-0000-0000-000000000004', 'Lugares Históricos', 'lugares-historicos', 'landmark', 3),
    ('c1111111-0000-0000-0000-000000000005', 'Deportes Extremos', 'deportes-extremos', 'mountain', 4),
    ('c1111111-0000-0000-0000-000000000006', 'Naturaleza', 'naturaleza', 'palmtree', 5)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    "displayOrder" = EXCLUDED."displayOrder";

-- 3. Lugares Semilla (Places)
INSERT INTO public.places (
    id, name, description, address, latitude, longitude, "openingHours",
    "priceRange", "hasStudentDiscount", "isStudyFriendly", images,
    "categoryId", "authorId", "hasWifi", "isOpen", "averageRating", "totalReviews"
)
VALUES
    (
        'p1111111-0000-0000-0000-000000000001',
        'Cineplex Manta - Mall del Pacífico',
        'Cineplex Manta - Mall del Pacífico - Glorietas Universitarios, Manta.',
        'Av. Circunvalación y Calle 23, Manta',
        -0.9482,
        -80.7329,
        '11:00 AM - 10:30 PM',
        'MODERATE',
        TRUE,
        FALSE,
        ARRAY['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'],
        'c1111111-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        TRUE,
        TRUE,
        5.0,
        142
    ),
    (
        'p1111111-0000-0000-0000-000000000002',
        'La Hueca de Pedro - Mariscos',
        'La Hueca de Pedro - Mariscos com corrdid y paraumente en Manta.',
        'Tarqui, Frente al Malecón, Manta',
        -0.9521,
        -80.7183,
        '08:00 AM - 05:00 PM',
        'CHEAP',
        TRUE,
        FALSE,
        ARRAY['https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80'],
        'c1111111-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        TRUE,
        TRUE,
        5.0,
        98
    ),
    (
        'p1111111-0000-0000-0000-000000000003',
        'Playa Murciélago - Surf',
        'Playa Murciélago - Surf, comortadamente e alea planaos amendo en Manta.',
        'Malecón Escénico, Playa Murciélago, Manta',
        -0.9419,
        -80.7391,
        '24 Horas',
        'CHEAP',
        TRUE,
        TRUE,
        ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
        'c1111111-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        TRUE,
        TRUE,
        5.0,
        210
    ),
    (
        'p1111111-0000-0000-0000-000000000004',
        'Centro Histórico & Basílica de Manta',
        'Patrimonio arquitectónico e historia viva de la cultura manteña.',
        'Centro de Manta, Calle 9 y Av. 2',
        -0.9548,
        -80.7250,
        '07:00 AM - 07:00 PM',
        'CHEAP',
        TRUE,
        TRUE,
        ARRAY['https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=800&q=80'],
        'c1111111-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        TRUE,
        TRUE,
        5.0,
        85
    ),
    (
        'p1111111-0000-0000-0000-000000000005',
        'Playa Murciélago - Sunset Beach',
        'Playa Murciélago - atardeceres mágicos, olas suaves y brisa marina.',
        'Costanera Manta Sur',
        -0.9430,
        -80.7420,
        '24 Horas',
        'CHEAP',
        TRUE,
        TRUE,
        ARRAY['https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'],
        'c1111111-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-000000000001',
        TRUE,
        TRUE,
        5.0,
        175
    ),
    (
        'p1111111-0000-0000-0000-000000000006',
        'Playa Murciélago - Parapente y Aventura',
        'Vuelo libre sobre los acantilados y costas con instructores certificados.',
        'San Mateo y Murciélago, Manta',
        -0.9610,
        -80.7850,
        '09:00 AM - 06:00 PM',
        'MODERATE',
        TRUE,
        FALSE,
        ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
        'c1111111-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        TRUE,
        TRUE,
        5.0,
        64
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Reseña Semilla
INSERT INTO public.reviews (id, rating, comment, "userId", "placeId", "authorName")
VALUES (
    'r1111111-0000-0000-0000-000000000001',
    5,
    'Excelente lugar, el descuento con carnet de la U aplica todos los martes.',
    'a0000000-0000-0000-0000-000000000001',
    'p1111111-0000-0000-0000-000000000001',
    'Ana G.'
) ON CONFLICT (id) DO NOTHING;
