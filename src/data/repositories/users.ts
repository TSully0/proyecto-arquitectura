import { type User } from '../../business/types/user';
import { supabase } from '../supabase';

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