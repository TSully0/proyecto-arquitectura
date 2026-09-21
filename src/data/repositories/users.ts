import {  type User  } from '../../business/types/user';

export const initialUsers: User[] = [
    {
        id: '1',
        name: 'Carlos Admin',
        email: 'admin.carlos@gmail.com',
        password: 'password123',
        role: 'admin' // Primer nivel / Administrador
    },
    {
        id: '2',
        name: 'María Moderadora',
        email: 'maria.mod@hotmail.com',
        password: 'password123',
        role: 'moderator' // Segundo nivel / Moderador
    },
    {
        id: '3',
        name: 'Juan Común',
        email: 'juan.user@email.com',
        password: 'password123',
        role: 'user' // Nivel bajo / Usuario estándar
    }
];