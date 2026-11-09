import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../business/types/user";
import { fetchNameFromSupabase } from "../../data/repositories/users";

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

// Solo los campos de sanción del usuario que acaba de entrar (no los de la copia local).
const pickSanction = (user: User) => ({
  banned: user.banned,
  suspendedUntil: user.suspendedUntil ?? null,
});

// Cuenta baneada o con suspensión vigente (según lo que trajo el login de Supabase).
const isBlocked = (user: User): boolean =>
  Boolean(user.banned) ||
  (typeof user.suspendedUntil === "number" && user.suspendedUntil > Date.now());

// Lee la sesión guardada y la actualiza con los datos locales (nombre, rol...).
// Los baneos y suspensiones NO se miran aquí: los vigila Supabase en
// subscribeToAccountStatus, que cierra la sesión apenas la cuenta queda bloqueada.
const readStoredUser = (): User | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const sessionUser = toSessionUser(resolveUser(JSON.parse(raw) as User));
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

  // Mantiene el nombre al día con Supabase (al abrir la app y al volver a la pestaña).
  useEffect(() => {
    const email = user?.email;
    if (!email) return;

    let cancelled = false;

    const syncName = async () => {
      const remoteName = await fetchNameFromSupabase(email);
      if (cancelled || !remoteName) return;

      try {
        const rawSession = localStorage.getItem(SESSION_KEY);
        if (rawSession) {
          const session = JSON.parse(rawSession) as User;
          if (session.name !== remoteName) {
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ ...session, name: remoteName })
            );
          }
        }

        const rawUsers = localStorage.getItem(USERS_KEY);
        if (rawUsers) {
          const users: User[] = JSON.parse(rawUsers);
          const target = email.trim().toLowerCase();
          localStorage.setItem(
            USERS_KEY,
            JSON.stringify(
              users.map((u) =>
                (u.email || "").trim().toLowerCase() === target
                  ? { ...u, name: remoteName }
                  : u
              )
            )
          );
        }
      } catch {
        /* si falla el guardado local, igual se actualiza el estado */
      }

      setUser((prev) =>
        prev && prev.name !== remoteName ? { ...prev, name: remoteName } : prev
      );
    };

    syncName();
    window.addEventListener("focus", syncName);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncName);
    };
  }, [user?.email]);

  const login = useCallback((loggedUser: User) => {
    // El login ya trae el estado real de la cuenta desde Supabase.
    const current = { ...resolveUser(loggedUser), ...pickSanction(loggedUser) };

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