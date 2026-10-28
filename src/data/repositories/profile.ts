import type { CommunityUser, ProfilePost } from "../../business/types/profile";
import { supabase } from "../supabase";
import { fetchPlaceLikes, getSupabaseUserId } from "./places";

// DATOS DE EJEMPLO.
// Cuando exista la base de datos, solo se cambia el interior de estas funciones
// y las pantallas siguen igual.

const SAMPLE_PEOPLE: CommunityUser[] = [
  { id: "10", name: "Luis Mendoza", role: "user" },
  { id: "11", name: "Andrea Pico", role: "user" },
  { id: "12", name: "Carlos Tech", role: "moderator" }
];

export const getCommunityPeople = (): CommunityUser[] => SAMPLE_PEOPLE;

export const getPostsByUser = (userId: string): ProfilePost[] => [
  {
    id: "p1",
    userId,
    title: "Cineplex Manta",
    description: "Excelente lugar después de clases",
    location: "Manta",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
    likes: 54,
    comments: 8
  },
  {
    id: "p2",
    userId,
    title: "Playa Murciélago",
    description: "Atardecer increíble",
    location: "Manta",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    likes: 87,
    comments: 14
  }
];

const FALLBACK_POST_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

// "Tus publicaciones": las reseñas y comentarios que el usuario escribió, traídos de Supabase.
// Cada tarjeta muestra el lugar, el texto del usuario y los likes y reseñas de ese lugar.
export async function fetchPostsByUser(email: string): Promise<ProfilePost[]> {
  const userId = await getSupabaseUserId(email);

  const { data, error } = await supabase
    .from("reviews")
    .select("id, comment, placeId, createdAt, places(*)")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar tus publicaciones: ${error.message}`);
  }

  const reviews = data ?? [];
  if (reviews.length === 0) return [];

  const placeIds = Array.from(new Set(reviews.map((review) => review.placeId as string)));

  // likes por lugar y cantidad de reseñas por lugar
  const [likes, placeReviews] = await Promise.all([
    fetchPlaceLikes(placeIds, ""),
    supabase.from("reviews").select("placeId").in("placeId", placeIds)
  ]);

  const commentCounts: Record<string, number> = {};
  (placeReviews.data ?? []).forEach((row) => {
    commentCounts[row.placeId] = (commentCounts[row.placeId] ?? 0) + 1;
  });

  return reviews.map((review) => {
    const place = Array.isArray(review.places) ? review.places[0] : review.places;
    return {
      id: review.id,
      userId,
      title: place?.name ?? "Lugar de Manta",
      description: review.comment,
      location: place?.address ?? "Manta",
      image:
        place?.image_url ||
        (Array.isArray(place?.images) ? place.images[0] : "") ||
        FALLBACK_POST_IMAGE,
      likes: likes.counts[review.placeId] ?? 0,
      comments: commentCounts[review.placeId] ?? 0
    };
  });
}