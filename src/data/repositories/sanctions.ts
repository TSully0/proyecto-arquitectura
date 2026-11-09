// data/repositories/sanctions.ts
// Baneos y suspensiones guardados en Supabase (tabla user_sanctions).
// Es la única fuente de verdad: el login, los paneles y la sesión abierta
// leen de aquí, así que funciona igual en cualquier navegador.

import type { User } from '../../business/types/user';
import { supabase } from '../supabase';

/* =========================
   TIPOS
   ========================= */
export type ManagedAccount = User & {
  banned: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
  sanctionCategory?: string;
  suspensionLabel?: string;
  liftedNotice?: 'suspension' | 'ban';
  liftedBy?: string;
};

type SanctionRow = {
  banned: boolean | null;
  suspendedUntil: string | null;
  sanctionReason: string | null;
  sanctionCategory: string | null;
  suspensionLabel: string | null;
  liftedNotice: 'suspension' | 'ban' | null;
  liftedBy: string | null;
};

export type SanctionFields = Pick<
  ManagedAccount,
  | 'banned'
  | 'suspendedUntil'
  | 'sanctionReason'
  | 'sanctionCategory'
  | 'suspensionLabel'
  | 'liftedNotice'
  | 'liftedBy'
>;

/** Columnas de user_sanctions, para incluirlas en un select de users. */
export const SANCTION_EMBED =
  'user_sanctions(banned, suspendedUntil, sanctionReason, sanctionCategory, suspensionLabel, liftedNotice, liftedBy)';

/* =========================
   LECTURA
   ========================= */

// Según la relación, Supabase devuelve un objeto o una lista de un elemento.
const pickSanction = (embedded: unknown): SanctionRow | null => {
  const row = Array.isArray(embedded) ? embedded[0] : embedded;
  return row && typeof row === 'object' ? (row as SanctionRow) : null;
};

/** Convierte lo que viene de la base de datos en los campos que usa la app. */
export function toSanctionFields(
  embedded: unknown,
  isActive?: boolean | null
): SanctionFields {
  const s = pickSanction(embedded);
  const until = s?.suspendedUntil ? new Date(s.suspendedUntil).getTime() : null;

  return {
    // isActive=false se respeta como baneo por si alguien lo cambió a mano.
    banned: Boolean(s?.banned) || isActive === false,
    suspendedUntil: until !== null && !Number.isNaN(until) ? until : null,
    sanctionReason: s?.sanctionReason ?? '',
    sanctionCategory: s?.sanctionCategory ?? '',
    suspensionLabel: s?.suspensionLabel ?? '',
    liftedNotice: s?.liftedNotice ?? undefined,
    liftedBy: s?.liftedBy ?? undefined
  };
}

type UserRow = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: unknown;
  isActive: boolean | null;
  user_sanctions?: unknown;
};

const toFrontRole = (role: unknown): User['role'] => {
  const value = String(role).toUpperCase();
  return value === 'ADMIN' ? 'admin' : value === 'MODERATOR' ? 'moderator' : 'user';
};

/** Todos los usuarios con su estado. null = no se pudo consultar. */
export async function fetchManagedUsers(): Promise<ManagedAccount[] | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`id, email, fullName, role, isActive, createdAt, ${SANCTION_EMBED}`)
      .order('createdAt', { ascending: true });

    if (error || !data) {
      console.warn('Error al leer los usuarios con sanciones:', error);
      return null;
    }

    return (data as unknown as UserRow[]).map((row) => ({
      id: String(row.id),
      email: String(row.email ?? ''),
      name: String(row.fullName ?? ''),
      password: '',
      role: toFrontRole(row.role),
      ...toSanctionFields(row.user_sanctions, row.isActive)
    }));
  } catch (err) {
    console.warn('Excepción al leer los usuarios con sanciones:', err);
    return null;
  }
}

/**
 * Estado actual de una cuenta. null = no se pudo consultar o la cuenta no existe
 * en Supabase (por ejemplo las cuentas de prueba que solo viven en el navegador).
 */
export async function fetchSanctionOf(userId: string): Promise<SanctionFields | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`isActive, ${SANCTION_EMBED}`)
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as unknown as UserRow;
    return toSanctionFields(row.user_sanctions, row.isActive);
  } catch {
    return null;
  }
}

/* =========================
   ESCRITURA
   ========================= */
const CLEAN = {
  sanctionReason: '',
  sanctionCategory: '',
  suspensionLabel: ''
};

async function upsertSanction(
  userId: string,
  patch: Record<string, unknown>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sanctions')
      .upsert(
        { userId, ...patch, updatedAt: new Date().toISOString() },
        { onConflict: 'userId' }
      );

    if (error) {
      console.warn('No se pudo guardar la sanción:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Excepción al guardar la sanción:', err);
    return false;
  }
}

export const banUserInSupabase = (userId: string, reason: string) =>
  upsertSanction(userId, {
    banned: true,
    suspendedUntil: null,
    sanctionReason: reason,
    sanctionCategory: '',
    suspensionLabel: '',
    liftedNotice: null,
    liftedBy: null
  });

export const suspendUserInSupabase = (
  userId: string,
  data: { reason: string; category: string; label: string; until: number }
) =>
  upsertSanction(userId, {
    banned: false,
    suspendedUntil: new Date(data.until).toISOString(),
    sanctionReason: data.reason,
    sanctionCategory: data.category,
    suspensionLabel: data.label,
    liftedNotice: null,
    liftedBy: null
  });

export async function liftBanInSupabase(
  userId: string,
  liftedBy: string
): Promise<boolean> {
  const ok = await upsertSanction(userId, {
    banned: false,
    ...CLEAN,
    liftedNotice: 'ban',
    liftedBy
  });

  if (ok) {
    // Por si la cuenta estaba bloqueada con isActive=false en la tabla.
    await supabase.from('users').update({ isActive: true }).eq('id', userId);
  }

  return ok;
}

export const liftSuspensionInSupabase = (userId: string, liftedBy: string) =>
  upsertSanction(userId, {
    suspendedUntil: null,
    ...CLEAN,
    liftedNotice: 'suspension',
    liftedBy
  });

/** Se llama después de avisar al usuario en el login que le quitaron la sanción. */
export async function clearLiftedNotice(userId: string): Promise<void> {
  try {
    await supabase
      .from('user_sanctions')
      .update({ liftedNotice: null, liftedBy: null })
      .eq('userId', userId);
  } catch {
    /* si falla, el aviso saldrá una vez más */
  }
}

/* =========================
   TIEMPO REAL
   ========================= */

/**
 * Avisa cada vez que cambia una sanción en la base de datos (de cualquier
 * navegador). Devuelve la función para dejar de escuchar.
 */
export function subscribeToSanctions(
  onChange: (userId: string | null) => void
): () => void {
  const channel = supabase
    .channel(`sanctions-${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_sanctions' },
      (payload) => {
        const row = (
          payload.new && Object.keys(payload.new).length > 0 ? payload.new : payload.old
        ) as { userId?: string } | undefined;

        onChange(row?.userId ?? null);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
