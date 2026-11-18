import { supabase } from '../supabase';

const SHARES_STORAGE_KEY = 'app_post_shares';

interface LocalShareMap {
  [postId: string]: number;
}

function getLocalShares(): LocalShareMap {
  try {
    const raw = localStorage.getItem(SHARES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalShares(shares: LocalShareMap): void {
  try {
    localStorage.setItem(SHARES_STORAGE_KEY, JSON.stringify(shares));
  } catch (err) {
    console.warn('No se pudo guardar contador de compartidos en localStorage:', err);
  }
}

/**
 * Obtiene el número de compartidos para una publicación.
 * Prioriza el conteo guardado localmente o en caché.
 */
export function getPostSharesCount(postId: string, fallbackDefault = 4): number {
  const local = getLocalShares();
  if (typeof local[postId] === 'number') {
    return local[postId];
  }
  return fallbackDefault;
}

/**
 * Trae los compartidos registrados en Supabase para una lista de lugares/posts.
 */
export async function fetchPlaceSharesFromSupabase(
  placeIds?: string[]
): Promise<Record<string, number>> {
  try {
    let query = supabase.from('place_shares').select('place_id, post_id');
    if (placeIds && placeIds.length > 0) {
      query = query.in('place_id', placeIds);
    }
    const { data, error } = await query;

    if (!error && Array.isArray(data)) {
      const counts: Record<string, number> = {};
      data.forEach((row) => {
        if (row.post_id) counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
        if (row.place_id) counts[row.place_id] = (counts[row.place_id] ?? 0) + 1;
      });
      return counts;
    }
  } catch {
    // Si la tabla no está creada aún en Supabase, usa el almacenamiento local
  }
  return {};
}

/**
 * Registra una acción de compartir tanto en Supabase (tabla place_shares)
 * como en el almacenamiento local para sincronización y persistencia inmediata.
 */
export async function recordPostShare(
  postId: string,
  placeId?: string,
  userId?: string
): Promise<number> {
  const local = getLocalShares();
  const currentCount = typeof local[postId] === 'number' ? local[postId] : 4;
  const newCount = currentCount + 1;
  local[postId] = newCount;
  saveLocalShares(local);

  // Intentar guardar en Supabase si la tabla place_shares existe
  if (placeId) {
    try {
      await supabase.from('place_shares').insert([
        {
          post_id: postId,
          place_id: placeId,
          user_id: userId || null
        }
      ]);
    } catch (err) {
      console.warn('Persistencia remota de compartir pendiente de migración en BD:', err);
    }
  }

  return newCount;
}
