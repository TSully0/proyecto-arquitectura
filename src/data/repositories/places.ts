import { supabase } from '../supabase';
import type { Place, Review, CategoryId, CategoryItem } from '../../business/types/place';

export const initialCategories: CategoryItem[] = [
  { id: 'inicio', name: 'Inicio', iconName: 'home' },
  { id: 'cines', name: 'Cines', iconName: 'film' },
  { id: 'comida', name: 'Comida', iconName: 'utensils' },
  { id: 'historicos', name: 'Lugares Históricos', iconName: 'landmark' },
  { id: 'extremos', name: 'Deportes Extremos', iconName: 'mountain' },
  { id: 'naturaleza', name: 'Naturaleza', iconName: 'palmtree' }
];

export const initialPlaces: Place[] = [
  {
    id: 'cineplex-manta',
    name: 'Cineplex Manta - Mall del Pacífico',
    category_id: 'cines',
    description: 'Cineplex Manta - Mall del Pacífico - Glorietas Universitarios, Manta.',
    address: 'Mall del Pacífico, Av. Malecón, Manta',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    review_count: 148,
    has_student_discount: true,
    has_wifi: true,
    is_open: true,
    latitude: -0.9482,
    longitude: -80.7329,
    likes_count: 320
  },
  {
    id: 'la-hueca-de-pedro',
    name: 'La Hueca de Pedro - Mariscos',
    category_id: 'comida',
    description: 'La Hueca de Pedro - Mariscos com corrdid y paraumente en Manta.',
    address: 'Tarqui, Malecón frente al puerto, Manta',
    image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    review_count: 215,
    has_student_discount: true,
    has_wifi: true,
    is_open: true,
    latitude: -0.9521,
    longitude: -80.7183,
    likes_count: 412
  },
  {
    id: 'playa-murcielago-surf',
    name: 'Playa Murciélago - Surf',
    category_id: 'extremos',
    description: 'Playa Murciélago - Surf, comortadamente e alea planaos amendo en Manta.',
    address: 'Playa Murciélago, Manta',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    review_count: 380,
    has_student_discount: true,
    has_wifi: true,
    is_open: true,
    latitude: -0.9419,
    longitude: -80.7391,
    likes_count: 589
  },
  {
    id: 'cineplex-manta-2',
    name: 'Cineplex Manta - Mall del Pacífico',
    category_id: 'historicos',
    description: 'Cineplex Manta - Mall del Pacífico y de universitario.',
    address: 'Av. Circunvalación, Manta',
    image_url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    review_count: 92,
    has_student_discount: true,
    has_wifi: true,
    is_open: true,
    latitude: -0.9548,
    longitude: -80.725,
    likes_count: 140
  },
  {
    id: 'playa-murcielago-sunset',
    name: 'Playa Murciélago - Surf',
    category_id: 'naturaleza',
    description: 'Playa Murciélago - surf santamentosbrica, orassones y anturaleo.',
    address: 'Costanera Manta',
    image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    review_count: 240,
    has_student_discount: true,
    has_wifi: true,
    is_open: true,
    latitude: -0.943,
    longitude: -80.742,
    likes_count: 275
  },
  {
    id: 'playa-murcielago-naturale',
    name: 'Playa Murciélago - Naturale a Manta',
    category_id: 'naturaleza',
    description: 'Playa Murciélago con Manta.',
    address: 'Mirador costero, Manta',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    review_count: 110,
    has_student_discount: true,
    has_wifi: true,
    is_open: true,
    latitude: -0.961,
    longitude: -80.785,
    likes_count: 198
  }
];

// Mapeo bidireccional de Categorías entre slugs del frontend y UUIDs de Supabase
export const CATEGORY_UUID_MAP: Record<string, CategoryId> = {
  'c1111111-0000-0000-0000-000000000001': 'cines',
  'c1111111-0000-0000-0000-000000000003': 'comida',
  'c1111111-0000-0000-0000-000000000004': 'historicos',
  'c1111111-0000-0000-0000-000000000005': 'extremos',
  'c1111111-0000-0000-0000-000000000006': 'naturaleza',
};

export const CATEGORY_SLUG_TO_UUID: Record<CategoryId, string> = {
  inicio: 'c1111111-0000-0000-0000-000000000001',
  cines: 'c1111111-0000-0000-0000-000000000001',
  comida: 'c1111111-0000-0000-0000-000000000003',
  historicos: 'c1111111-0000-0000-0000-000000000004',
  extremos: 'c1111111-0000-0000-0000-000000000005',
  naturaleza: 'c1111111-0000-0000-0000-000000000006',
};

export async function fetchPlacesFromRepository(): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*');

    if (error || !data || data.length === 0) {
      return initialPlaces;
    }

    return data.map((item: any) => {
      const rawCat = item.categoryId || item.category_id || '';
      const mappedCategory: CategoryId =
        CATEGORY_UUID_MAP[rawCat] ||
        (['inicio', 'cines', 'comida', 'historicos', 'extremos', 'naturaleza'].includes(rawCat)
          ? (rawCat as CategoryId)
          : 'comida');

      return {
        id: item.id,
        name: item.name,
        category_id: mappedCategory,
        description: item.description,
        address: item.address,
        image_url:
          item.image_url ||
          (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : ''),
        rating: Number(item.averageRating || item.rating) || 5.0,
        review_count: item.totalReviews || item.review_count || 0,
        has_student_discount: Boolean(item.hasStudentDiscount ?? item.has_student_discount),
        has_wifi: Boolean(item.hasWifi ?? item.has_wifi),
        is_open: Boolean(item.isOpen ?? item.is_open),
        is_pet_friendly: Boolean(item.isPetFriendly ?? item.is_pet_friendly),
        is_accessible: Boolean(item.isAccessible ?? item.is_accessible),
        is_night_spot: Boolean(item.isNightSpot ?? item.is_night_spot),
        latitude: item.latitude,
        longitude: item.longitude,
        likes_count: 10
      };
    });
  } catch (err) {
    console.warn('Supabase fetch fallback to local seed:', err);
    return initialPlaces;
  }
}

// =============================================================================
// RESEÑAS Y COMENTARIOS (tabla "reviews" de Supabase)
// Regla: rating con valor (1 a 5) = visitó y calificó; rating null = comentario
// o pregunta sin calificación (ver supabase_reviews_migration.sql).
// =============================================================================
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Los lugares de ejemplo del feed usan ids tipo "cineplex-manta", pero en
// Supabase esos mismos lugares tienen un UUID (ver DATOS SEMILLA en supabase_schema.sql).
export const PLACE_SLUG_TO_UUID: Record<string, string> = {
  'cineplex-manta': 'b1111111-0000-0000-0000-000000000001',
  'la-hueca-de-pedro': 'b1111111-0000-0000-0000-000000000002',
  'playa-murcielago-surf': 'b1111111-0000-0000-0000-000000000003',
  'cineplex-manta-2': 'b1111111-0000-0000-0000-000000000004',
  'playa-murcielago-sunset': 'b1111111-0000-0000-0000-000000000005',
  'playa-murcielago-naturale': 'b1111111-0000-0000-0000-000000000006'
};

// Devuelve el UUID real del lugar en Supabase, o null si no existe allí.
// Antes se usaba el UUID del Cineplex como reemplazo y los comentarios podían
// guardarse en el lugar equivocado; ahora, si no se encuentra, no se guarda.
export function resolvePlaceId(placeId: string): string | null {
  if (UUID_REGEX.test(placeId)) return placeId;
  return PLACE_SLUG_TO_UUID[placeId] ?? null;
}

export async function addReviewToSupabase(review: Omit<Review, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const placeId = resolvePlaceId(review.place_id);
    if (!placeId) {
      console.warn('Reseña no guardada: el lugar no existe en Supabase:', review.place_id);
      return false;
    }

    const dbPayload = {
      // Sin estrellas -> null (antes se convertía en 5 y subía el promedio del lugar)
      rating: review.rating ? Math.min(5, Math.max(1, Math.round(review.rating))) : null,
      comment: review.comment,
      authorName: review.author_name || 'Estudiante Manta',
      placeId: placeId,
      userId: review.user_id && UUID_REGEX.test(review.user_id) ? review.user_id : null
    };

    const { error } = await supabase.from('reviews').insert([dbPayload]);
    if (error) {
      console.warn('Error al guardar reseña en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción al conectar con Supabase (reviews):', err);
    return false;
  }
}

// Lee de Supabase todos los comentarios de los lugares indicados (más antiguos primero)
export async function fetchReviewsByPlaceIds(placeIds: string[]): Promise<Review[]> {
  try {
    const uuids = placeIds
      .map(resolvePlaceId)
      .filter((id): id is string => id !== null);
    if (uuids.length === 0) return [];

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .in('placeId', uuids)
      .order('createdAt', { ascending: true });

    if (error || !data) {
      console.warn('Error al leer reseñas de Supabase:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      place_id: row.placeId,
      user_id: row.userId ?? undefined,
      author_name: row.authorName || 'Estudiante Manta',
      rating: row.rating ?? undefined,
      has_visited: row.rating !== null && row.rating !== undefined,
      comment: row.comment || '',
      created_at: row.createdAt
    }));
  } catch (err) {
    console.warn('Excepción al leer reseñas de Supabase:', err);
    return [];
  }
}

export async function addPlaceToSupabase(place: Omit<Place, 'id' | 'likes_count'>): Promise<boolean> {
  try {
    const categoryUUID = CATEGORY_SLUG_TO_UUID[place.category_id] || 'c1111111-0000-0000-0000-000000000003';
    const imagesArray = place.images && place.images.length > 0
      ? place.images
      : place.image_url
      ? [place.image_url]
      : ['https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80'];

    const dbPayload = {
      name: place.name,
      description: place.description,
      address: place.address || 'Manta, Ecuador',
      latitude: place.latitude ?? -0.95,
      longitude: place.longitude ?? -80.73,
      priceRange: place.price_range || 'MODERATE',
      hasStudentDiscount: Boolean(place.has_student_discount),
      isStudyFriendly: Boolean(place.is_study_friendly),
      images: imagesArray,
      categoryId: categoryUUID,
      hasWifi: Boolean(place.has_wifi),
      isOpen: Boolean(place.is_open),
      isPetFriendly: Boolean(place.is_pet_friendly),
      isAccessible: Boolean(place.is_accessible),
      isNightSpot: Boolean(place.is_night_spot),
      averageRating: Number(place.rating) || 5.0,
      totalReviews: Number(place.review_count) || 1
    };

    const { error } = await supabase.from('places').insert([dbPayload]);
    if (error) {
      console.warn('Error al guardar lugar en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción al conectar con Supabase (places):', err);
    return false;
  }
}
 