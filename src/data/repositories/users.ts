import { type User } from '../../business/types/user';
import { supabase } from '../supabase';
import {
  SANCTION_EMBED,
  toSanctionFields,
  type ManagedAccount
} from './sanctions';

/* =========================
   USUARIOS BASE DEL SISTEMA
   ========================= */
export const initialUsers: (User & { banned?: boolean })[] = [
  // 👑 ADMINS
  {
    id: '1',
    name: 'Ana G.',
    email: 'ana.g@hotmail.com',
    password: btoa('password123'),
    role: 'admin',
    banned: false
  },
  {
    id: '2',
    name: 'Carlos Admin',
    email: 'admin.carlos@gmail.com',
    password: btoa('password123'),
    role: 'admin',
    banned: false
  },

  // 🛡️ MODERADOR
  {
    id: '3',
    name: 'María Moderadora',
    email: 'maria.mod@hotmail.com',
    password: btoa('password123'),
    role: 'moderator',
    banned: false
  },

  // 👤 USUARIOS NORMALES
  {
    id: '4',
    name: 'Juan Usuario',
    email: 'juan.user@email.com',
    password: btoa('password123'),
    role: 'user',
    banned: false
  },
  {
    id: '5',
    name: 'Camila Ruiz',
    email: 'camila.ruiz@hotmail.com',
    password: btoa('password123'),
    role: 'user',
    banned: false
  },

  // ⚠️ USUARIO PROBLEMÁTICO (activo pero sospechoso)
  {
    id: '6',
    name: 'Pedro López',
    email: 'pedro.lopez@gmail.com',
    password: btoa('password123'),
    role: 'user',
    banned: false
  },

  // 🚫 BANEADOS
  {
    id: '7',
    name: 'Usuario Spam',
    email: 'spam1@email.com',
    password: btoa('password123'),
    role: 'user',
    banned: true
  },
  {
    id: '8',
    name: 'Troll User',
    email: 'troll@gmail.com',
    password: btoa('password123'),
    role: 'user',
    banned: true
  }
];

/* =========================
   SYNC CON SUPABASE
   ========================= */
export async function syncUserToSupabase(user: {
  name: string;
  email: string;
  password?: string;
  role?: string;
}): Promise<boolean> {
  try {
    const roleUpper =
      user.role === 'admin'
        ? 'ADMIN'
        : user.role === 'moderator'
        ? 'MODERATOR'
        : 'STUDENT';

    const { error } = await supabase.from('users').upsert(
      {
        email: user.email.trim().toLowerCase(),
        passwordHash: user.password || btoa('default123'),
        fullName: user.name,
        role: roleUpper,
        isActive: true
      },
      { onConflict: 'email', ignoreDuplicates: true }
    );

    if (error) {
      console.warn('Error al sincronizar usuario con Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Excepción al conectar usuario con Supabase:', err);
    return false;
  }
}


/* =========================
   LOGIN DESDE SUPABASE
   ========================= */
export async function fetchUserFromSupabase(
  identifier: string,
  encodedPassword: string
): Promise<User | null> {
  try {
    const clean = identifier.trim().toLowerCase().replace(/[",()]/g, '');
    if (!clean) return null;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, passwordHash, fullName, role, isActive')
      .or(`email.eq.${clean},fullName.ilike.${clean}`)
      .eq('passwordHash', encodedPassword)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('Error al leer usuario de Supabase:', error);
      return null;
    }

    const role = String(data.role).toUpperCase();

    return {
      id: data.id,
      email: data.email,
      password: data.passwordHash,
      name: data.fullName,
      role: role === 'ADMIN' ? 'admin' : role === 'MODERATOR' ? 'moderator' : 'user',
      banned: data.isActive === false
    };
  } catch (err) {
    console.warn('Excepción al leer usuario de Supabase:', err);
    return null;
  }
}


/* =========================
   REGISTRO EN SUPABASE
   ========================= */
export type RegisterResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'duplicate' | 'error' };

// Crea la cuenta en Supabase. Devuelve el id (uuid) real de la base de datos.
export async function registerUserInSupabase(user: {
  name: string;
  email: string;
  password: string; // ya codificada (btoa)
}): Promise<RegisterResult> {
  try {
    const email = user.email.trim().toLowerCase();
    const name = user.name.trim();
    const safeName = name.replace(/[\\%_]/g, '\\$&');

    // 1) ¿Ya existe el correo o el nombre?
    const [byEmail, byName] = await Promise.all([
      supabase.from('users').select('id').eq('email', email).limit(1),
      supabase.from('users').select('id').ilike('fullName', safeName).limit(1)
    ]);

    if (byEmail.error || byName.error) {
      console.warn('Error al comprobar duplicados:', byEmail.error || byName.error);
      return { ok: false, reason: 'error' };
    }

    if ((byEmail.data?.length ?? 0) > 0 || (byName.data?.length ?? 0) > 0) {
      return { ok: false, reason: 'duplicate' };
    }

    // 2) Crear la cuenta
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        passwordHash: user.password,
        fullName: name,
        role: 'STUDENT',
        isActive: true
      })
      .select('id')
      .single();

    if (error) {
      console.warn('Error al crear usuario en Supabase:', error);
      return { ok: false, reason: error.code === '23505' ? 'duplicate' : 'error' };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    console.warn('Excepción al registrar en Supabase:', err);
    return { ok: false, reason: 'error' };
  }
}


// Comprueba en Supabase si el correo o el nombre ya existen.
// Devuelve null si no se pudo consultar (no se debe asumir que está libre).
export async function checkUserExistsInSupabase(
  name: string,
  email: string
): Promise<{ email: boolean; name: boolean } | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const safeName = name.trim().replace(/[\\%_]/g, '\\$&');

    const [byEmail, byName] = await Promise.all([
      supabase.from('users').select('id').eq('email', cleanEmail).limit(1),
      supabase.from('users').select('id').ilike('fullName', safeName).limit(1)
    ]);

    if (byEmail.error || byName.error) {
      console.warn('Error al comprobar duplicados:', byEmail.error || byName.error);
      return null;
    }

    return {
      email: (byEmail.data?.length ?? 0) > 0,
      name: (byName.data?.length ?? 0) > 0
    };
  } catch (err) {
    console.warn('Excepción al comprobar duplicados:', err);
    return null;
  }
}


/* =========================
   RECUPERAR CONTRASEÑA
   ========================= */

// ¿Existe este correo en Supabase? null = no se pudo consultar.
export async function emailExistsInSupabase(email: string): Promise<boolean | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (error) {
      console.warn('Error al buscar el correo en Supabase:', error);
      return null;
    }

    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.warn('Excepción al buscar el correo en Supabase:', err);
    return null;
  }
}

// Cambia la contraseña (ya codificada con btoa) en Supabase.
// Devuelve true solo si realmente se actualizó una fila.
export async function updatePasswordInSupabase(
  email: string,
  encodedPassword: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ passwordHash: encodedPassword })
      .eq('email', email.trim().toLowerCase())
      .select('id');

    if (error) {
      console.warn('Error al actualizar la contraseña en Supabase:', error);
      return false;
    }

    // Sin política RLS de UPDATE, Supabase no da error pero tampoco actualiza nada.
    if (!data || data.length === 0) {
      console.warn('No se actualizó ninguna fila (¿falta la política RLS de UPDATE?).');
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Excepción al actualizar la contraseña en Supabase:', err);
    return false;
  }
}


/* =========================
   LOGIN: SUPABASE MANDA
   ========================= */
export type RemoteLoginResult =
  | { status: 'ok'; user: ManagedAccount }
  | { status: 'wrong_password' } // la cuenta existe en Supabase, pero la clave no coincide
  | { status: 'not_found' }      // no existe en Supabase
  | { status: 'error' };         // no se pudo consultar

export async function loginWithSupabase(
  identifier: string,
  encodedPassword: string
): Promise<RemoteLoginResult> {
  try {
    const clean = identifier.trim().toLowerCase().replace(/[",()]/g, '');
    if (!clean) return { status: 'not_found' };

    const { data, error } = await supabase
      .from('users')
      .select(`id, email, passwordHash, fullName, role, isActive, ${SANCTION_EMBED}`)
      .or(`email.eq.${clean},fullName.ilike.${clean}`)
      .limit(5);

    if (error) {
      console.warn('Error al consultar usuario en Supabase:', error);
      return { status: 'error' };
    }

    if (!data || data.length === 0) return { status: 'not_found' };

    const rows = data as unknown as {
      id: string;
      email: string;
      passwordHash: string;
      fullName: string;
      role: unknown;
      isActive: boolean | null;
      user_sanctions?: unknown;
    }[];

    const row = rows.find((r) => r.passwordHash === encodedPassword);
    if (!row) return { status: 'wrong_password' };

    const role = String(row.role).toUpperCase();

    return {
      status: 'ok',
      user: {
        id: row.id,
        email: row.email,
        password: row.passwordHash,
        name: row.fullName,
        role: role === 'ADMIN' ? 'admin' : role === 'MODERATOR' ? 'moderator' : 'user',
        // Baneo, suspensión y avisos salen de la base de datos (user_sanctions).
        ...toSanctionFields(row.user_sanctions, row.isActive)
      }
    };
  } catch (err) {
    console.warn('Excepción al consultar usuario en Supabase:', err);
    return { status: 'error' };
  }
}


/* =========================
   CAMBIAR NOMBRE
   ========================= */
export type NameUpdateResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'not_found' | 'error' };

// Cambia el nombre (fullName) en Supabase y en las reseñas del usuario.
export async function updateNameInSupabase(
  email: string,
  newName: string
): Promise<NameUpdateResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const name = newName.trim();
    const safeName = name.replace(/[\\%_]/g, '\\$&');

    // 1) ¿Existe la cuenta en Supabase?
    const current = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .limit(1);

    if (current.error) {
      console.warn('Error al buscar la cuenta:', current.error);
      return { ok: false, reason: 'error' };
    }
    if (!current.data || current.data.length === 0) {
      return { ok: false, reason: 'not_found' };
    }

    // 2) ¿Otro usuario ya tiene ese nombre?
    const clash = await supabase
      .from('users')
      .select('id')
      .ilike('fullName', safeName)
      .neq('email', cleanEmail)
      .limit(1);

    if (clash.error) {
      console.warn('Error al comprobar el nombre:', clash.error);
      return { ok: false, reason: 'error' };
    }
    if (clash.data && clash.data.length > 0) {
      return { ok: false, reason: 'duplicate' };
    }

    // 3) Actualizar el nombre
    const { data, error } = await supabase
      .from('users')
      .update({ fullName: name })
      .eq('email', cleanEmail)
      .select('id');

    if (error || !data || data.length === 0) {
      console.warn('No se pudo actualizar el nombre (¿falta política RLS de UPDATE?):', error);
      return { ok: false, reason: 'error' };
    }

    // 4) Reflejar el nombre nuevo en las reseñas ya publicadas (si la política lo permite).
    const reviews = await supabase
      .from('reviews')
      .update({ authorName: name })
      .eq('userId', data[0].id);

    if (reviews.error) {
      console.warn('No se actualizó el nombre en las reseñas:', reviews.error);
    }

    return { ok: true };
  } catch (err) {
    console.warn('Excepción al cambiar el nombre:', err);
    return { ok: false, reason: 'error' };
  }
}

// Nombre actual del usuario en Supabase (null si no existe o no se pudo consultar).
export async function fetchNameFromSupabase(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('fullName')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return data.fullName ?? null;
  } catch {
    return null;
  }
}


/* =========================
   GESTIÓN DE ROLES (ADMIN)
   ========================= */
export type DbUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  createdAt: string | null;
};

const toFrontRole = (role: unknown): DbUser['role'] => {
  const value = String(role).toUpperCase();
  return value === 'ADMIN' ? 'admin' : value === 'MODERATOR' ? 'moderator' : 'user';
};

// Todos los usuarios de la tabla users. null = no se pudo consultar.
export async function fetchAllUsersFromSupabase(): Promise<DbUser[] | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, fullName, role, createdAt')
      .order('createdAt', { ascending: true });

    if (error || !data) {
      console.warn('Error al leer los usuarios de Supabase:', error);
      return null;
    }

    return data.map((row) => ({
      id: String(row.id),
      name: String(row.fullName ?? ''),
      email: String(row.email ?? ''),
      role: toFrontRole(row.role),
      createdAt: row.createdAt ? String(row.createdAt) : null
    }));
  } catch (err) {
    console.warn('Excepción al leer los usuarios de Supabase:', err);
    return null;
  }
}

// Cambia el rol en Supabase. true solo si realmente se actualizó una fila.
export async function updateRoleInSupabase(
  id: string,
  role: 'moderator' | 'user'
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: role === 'moderator' ? 'MODERATOR' : 'STUDENT' })
      .eq('id', id)
      .select('id');

    if (error || !data || data.length === 0) {
      console.warn('No se pudo actualizar el rol (¿falta política RLS de UPDATE?):', error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Excepción al actualizar el rol:', err);
    return false;
  }
}