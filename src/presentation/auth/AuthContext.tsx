import { createContext, useContext, useState } from "react";
import type { User } from "../../business/types/user";

    type AuthContextType = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    };

    const AuthContext = createContext<AuthContextType | null>(null);
    // lee el usuario guardado (sin useEffect, para que exista desde el primer render)
    const readStoredUser = (): User | null => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
    };

    export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(readStoredUser);
    // LOGIN
    const login = (loggedUser: User) => {
        const cleanUser: User = {
        ...loggedUser,
        role: String(loggedUser.role).toLowerCase().trim() as User["role"],
        };
        localStorage.setItem("user", JSON.stringify(cleanUser));
        setUser(cleanUser);
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
    };
    export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
    };
