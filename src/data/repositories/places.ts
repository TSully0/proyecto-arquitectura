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

export async function fetchPlacesFromRepository(): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialPlaces;
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      category_id: item.category_id as CategoryId,
      description: item.description,
      address: item.address,
      image_url: item.image_url,
      rating: Number(item.rating) || 5.0,
      review_count: item.review_count || 0,
      has_student_discount: Boolean(item.has_student_discount),
      has_wifi: Boolean(item.has_wifi),
      is_open: Boolean(item.is_open),
      latitude: item.latitude,
      longitude: item.longitude,
      likes_count: 10
    }));
  } catch (err) {
    console.warn('Supabase fetch fallback to local seed:', err);
    return initialPlaces;
  }
}

export async function addReviewToSupabase(review: Omit<Review, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase.from('reviews').insert([review]);
    return !error;
  } catch {
    return false;
  }
}

export async function addPlaceToSupabase(place: Omit<Place, 'id' | 'likes_count'>): Promise<boolean> {
  try {
    const { error } = await supabase.from('places').insert([place]);
    return !error;
  } catch {
    return false;
  }
}
