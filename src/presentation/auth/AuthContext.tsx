import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "../../business/types/user";

const SESSION_KEY = "user";
const USERS_KEY = "app_users";

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Normaliza el rol y elimina la contraseña antes de guardar la sesión.
const toSessionUser = (user: User): User => ({
  ...user,
  password: "",
  role: String(user.role).toLowerCase().trim() as User["role"],
});

// Busca al usuario en app_users: primero por ID y luego por correo.
const findStoredUser = (user: User): User | null => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return null;

    const users: User[] = JSON.parse(raw);
    const email = user.email?.trim().toLowerCase();

    return (
      users.find((item) => Boolean(user.id) && item.id === user.id) ??
      users.find(
        (item) => Boolean(email) && item.email?.trim().toLowerCase() === email
      ) ??
      null
    );
  } catch {
    return null;
  }
};

// Datos más recientes del usuario (app_users manda sobre la sesión).
const resolveUser = (user: User): User => findStoredUser(user) ?? user;

// Cuenta baneada o con suspensión vigente.
const isBlocked = (user: User): boolean =>
  Boolean(user.banned) ||
  (typeof user.suspendedUntil === "number" && user.suspendedUntil > Date.now());

// Lee la sesión guardada, la actualiza y la invalida si la cuenta está bloqueada.
const readStoredUser = (): User | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const current = resolveUser(JSON.parse(raw) as User);

    if (isBlocked(current)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    const sessionUser = toSessionUser(current);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);

  // Revalida la sesión al volver a la pestaña o si cambia el storage en otra pestaña.
  useEffect(() => {
    const revalidate = () => {
      const next = readStoredUser();
      setUser((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    };

    window.addEventListener("focus", revalidate);
    window.addEventListener("storage", revalidate);

    return () => {
      window.removeEventListener("focus", revalidate);
      window.removeEventListener("storage", revalidate);
    };
  }, []);

  const login = useCallback((loggedUser: User) => {
    const current = resolveUser(loggedUser);

    if (isBlocked(current)) {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      throw new Error(
        "Esta cuenta está suspendida. Contacta con el administrador."
      );
    }

    const sessionUser = toSessionUser(current);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};