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

ALTER TABLE public.reviews ALTER COLUMN rating DROP NOT NULL;