import { type User } from '../../business/types/user';

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