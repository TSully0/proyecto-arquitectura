export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'moderator' | 'user';
    banned: boolean;
    suspendedUntil?: number | null;
}