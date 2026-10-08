-- =============================================================================
-- MIGRACION: permitir comentarios sin calificacion (reseñas y comentarios)
-- Ejecutar UNA sola vez en Supabase > SQL Editor.
--
-- Por que: el modal de comentarios permite elegir "No lo he visitado aun"
-- (una pregunta, sin estrellas). La columna rating era NOT NULL, asi que esos
-- comentarios no se podian guardar.
--
-- Regla que usa el frontend:
--   rating con valor (1 a 5) -> el usuario visito el lugar y lo califico
--   rating NULL              -> comentario o pregunta sin calificacion
-- El CHECK (rating >= 1 AND rating <= 5) sigue vigente: un NULL lo cumple.
-- =============================================================================
-- Run once in Supabase SQL Editor after supabase_schema.sql.
-- Keeps place review counts and average ratings in sync with reviews.

ALTER TABLE public.reviews ALTER COLUMN rating DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_place_review_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    affected_place_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        affected_place_id := OLD."placeId";
    ELSE
        affected_place_id := NEW."placeId";
    END IF;

    UPDATE public.places
    SET
        "totalReviews" = (
            SELECT COUNT(*)::INT
            FROM public.reviews
            WHERE "placeId" = affected_place_id
        ),
        "averageRating" = COALESCE(
            (
                SELECT ROUND(AVG(rating)::NUMERIC, 1)
                FROM public.reviews
                WHERE "placeId" = affected_place_id
                AND rating IS NOT NULL
            ),
            5.0
        )
    WHERE id = affected_place_id;

    IF TG_OP = 'UPDATE' AND OLD."placeId" IS DISTINCT FROM NEW."placeId" THEN
        UPDATE public.places
        SET
            "totalReviews" = (
                SELECT COUNT(*)::INT
                FROM public.reviews
                WHERE "placeId" = OLD."placeId"
            ),
            "averageRating" = COALESCE(
                (
                    SELECT ROUND(AVG(rating)::NUMERIC, 1)
                    FROM public.reviews
                    WHERE "placeId" = OLD."placeId"
                    AND rating IS NOT NULL
                ),
                5.0
            )
        WHERE id = OLD."placeId";
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_sync_place_stats ON public.reviews;
CREATE TRIGGER reviews_sync_place_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.sync_place_review_stats();

UPDATE public.places AS place
SET
    "totalReviews" = (
        SELECT COUNT(*)::INT
        FROM public.reviews AS review
        WHERE review."placeId" = place.id
    ),
    "averageRating" = COALESCE(
        (
            SELECT ROUND(AVG(review.rating)::NUMERIC, 1)
            FROM public.reviews AS review
            WHERE review."placeId" = place.id
            AND review.rating IS NOT NULL
        ),
        5.0
    );
