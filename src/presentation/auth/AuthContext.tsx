import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../../business/types/user";

type AuthContextType = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
};

    const AuthContext = createContext<AuthContextType | null>(null);

    export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

  // 🔥 cargar usuario al iniciar app
    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (raw) {
        try {
            setUser(JSON.parse(raw));
        } catch {
            localStorage.removeItem("user");
        }
        }
    }, []);

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