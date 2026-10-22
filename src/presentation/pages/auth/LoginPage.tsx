
import { useEffect, useState } from 'react';
import { initialUsers } from '../../../data/repositories/users';
import type { User } from '../../../business/types/user';
import {
  getGuardKey,
  isLoginLocked,
  registerFailedLogin,
  clearLoginAttempts
} from '../../../business/services/loginGuard';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (user: User) => void;
  onNavigateToForgotPassword: () => void;
}

type UserWithSanction = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
};

const LOCK_SECONDS = 60;
const LOGIN_ATTEMPTS_KEY = 'login_attempts';

export function LoginPage({
  onNavigateToRegister,
  onLoginSuccess,
  onNavigateToForgotPassword
}: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [guardKey, setGuardKey] = useState('');

  // Actualiza el bloqueo usando la hora real de desbloqueo.
  useEffect(() => {
    if (!guardKey) {
      setRemainingSeconds(0);
      return;
    }

    const updateLock = () => {
      if (!isLoginLocked(guardKey)) {
        setRemainingSeconds(0);

        // Limpiar únicamente los mensajes relacionados con el bloqueo.
        setError((previous) => {
          if (
            previous.includes('Has alcanzado 5 intentos fallidos') ||
            previous.includes('Tu cuenta está bloqueada temporalmente por seguridad')
          ) {
            return '';
          }

          return previous;
        });

        return;
      }

      try {
        const store = JSON.parse(
          localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}'
        );

        const lockedUntil = store[guardKey]?.lockedUntil;

        if (typeof lockedUntil !== 'number') {
          setRemainingSeconds(0);
          return;
        }

        const seconds = Math.max(
          0,
          Math.ceil((lockedUntil - Date.now()) / 1000)
        );

        setRemainingSeconds(seconds);
      } catch {
        setRemainingSeconds(0);
      }
    };

    updateLock();

    const interval = window.setInterval(updateLock, 250);

    return () => window.clearInterval(interval);
  }, [guardKey]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim().toLowerCase();

    const stored = localStorage.getItem('app_users');
    let storedUsers: UserWithSanction[] = [];

    try {
      storedUsers = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(storedUsers)) {
        setError('Los datos de usuarios no tienen un formato válido.');
        return;
      }
    } catch {
      setError('No se pudieron leer los datos de usuarios.');
      return;
    }

    const users: UserWithSanction[] =
      storedUsers.length > 0 ? storedUsers : initialUsers;

    const key = getGuardKey(users, cleanIdentifier);

    setGuardKey(key);

    // No permitir el acceso mientras la cuenta esté bloqueada.
    if (isLoginLocked(key)) {
      try {
        const store = JSON.parse(
          localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}'
        );

        const lockedUntil = store[key]?.lockedUntil;

        const seconds =
          typeof lockedUntil === 'number'
            ? Math.max(
                0,
                Math.ceil((lockedUntil - Date.now()) / 1000)
              )
            : LOCK_SECONDS;

        setRemainingSeconds(seconds);
      } catch {
        setRemainingSeconds(LOCK_SECONDS);
      }

      setError(
        'Tu cuenta está bloqueada temporalmente por seguridad.'
      );
      return;
    }

    // Buscar usuario y verificar la contraseña.
    const user = users.find((u) => {
      const matchIdentity =
        u.email.trim().toLowerCase() === cleanIdentifier ||
        u.name.trim().toLowerCase() === cleanIdentifier;

      let matchPassword = false;

      try {
        matchPassword = u.password === btoa(password);
      } catch {
        matchPassword = false;
      }

      return matchIdentity && matchPassword;
    });

    if (!user) {
      registerFailedLogin(key);

      if (isLoginLocked(key)) {
        try {
          const store = JSON.parse(
            localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}'
          );

          const lockedUntil = store[key]?.lockedUntil;

          const seconds =
            typeof lockedUntil === 'number'
              ? Math.max(
                  0,
                  Math.ceil((lockedUntil - Date.now()) / 1000)
                )
              : LOCK_SECONDS;

          setRemainingSeconds(seconds);
        } catch {
          setRemainingSeconds(LOCK_SECONDS);
        }

        setError(
          'Has alcanzado 5 intentos fallidos. ' +
          'El inicio de sesión está bloqueado temporalmente.'
        );
      } else {
        setRemainingSeconds(0);
        setError('Credenciales incorrectas.');
      }

      return;
    }

    // Comprobar las sanciones administrativas.
    if (user.banned) {
      setError(
        `Cuenta bloqueada permanentemente.\nMotivo: ${
          user.sanctionReason?.trim() ||
          'Incumplimiento de las normas de la comunidad.'
        }`
      );
      return;
    }

    if (
      user.suspendedUntil &&
      user.suspendedUntil > Date.now()
    ) {
      setError(
        `Cuenta suspendida temporalmente.\nMotivo: ${
          user.sanctionReason?.trim() ||
          'Incumplimiento de las normas de la comunidad.'
        }`
      );
      return;
    }

    // Limpiar intentos después de un inicio de sesión correcto.
    clearLoginAttempts(key);
    setRemainingSeconds(0);
    setError('');

    const cleanUser: User = {
      ...user,
      role: String(user.role).toLowerCase().trim() as User['role']
    };

    onLoginSuccess(cleanUser);
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>

      {error && (
        <p
          className="error"
          role="alert"
          style={{ whiteSpace: 'pre-line' }}
        >
          {error}

          {remainingSeconds > 0 && (
            <span>
              {'\n'}Puedes intentarlo nuevamente en{' '}
              <strong>{remainingSeconds} s</strong>.
            </span>
          )}
        </p>
      )}

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-identifier">
            Correo o usuario
          </label>

          <input
            id="login-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="usuario@ejemplo.com"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">
            Contraseña
          </label>

          <div className="password-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              aria-label={
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={remainingSeconds > 0}
        >
          {remainingSeconds > 0
            ? `Bloqueado (${remainingSeconds}s)`
            : 'Entrar'}
        </button>
      </form>

      <p>
        <button
          type="button"
          onClick={onNavigateToForgotPassword}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>

      <p>
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onNavigateToRegister}
        >
          Regístrate
        </button>
      </p>
    </div>
  );
}