import { type User } from '../../business/types/user';
import { supabase } from '../supabase';

/* =========================
   USUARIOS BASE DEL SISTEMA
   ========================= */
export const initialUsers: (User & { banned?: boolean })[] = [
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
  {
    id: '3',
    name: 'María Moderadora',
    email: 'maria.mod@hotmail.com',
    password: btoa('password123'),
    role: 'moderator',
    banned: false
  },
  {
    id: '4',
    name: 'Juan Usuario',
    email: 'juan.user@email.com',
    password: btoa('password123'),
    role: 'user',
    banned: false
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

    const { error } = await supabase.from('users').insert([
      {
        email: user.email,
        passwordHash: user.password || btoa('default123'),
        fullName: user.name,
        role: roleUpper,
        isActive: true
      }
    ]);

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