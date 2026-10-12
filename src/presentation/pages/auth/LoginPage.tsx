import { useState } from 'react';
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

// Campos adicionales usados para las sanciones
type UserWithSanction = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
};

const LOCKED_MESSAGE =
  'Cuenta bloqueada temporalmente por seguridad. Inténtalo de nuevo en unos minutos.';

export function LoginPage({
  onNavigateToRegister,
  onLoginSuccess,
  onNavigateToForgotPassword
}: LoginPageProps) {

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim().toLowerCase();

    const stored = localStorage.getItem('app_users');

    let storedUsers: UserWithSanction[] = [];

    try {
      storedUsers = stored ? JSON.parse(stored) : [];
    } catch {
      setError('No se pudieron leer los datos de usuarios.');
      return;
    }

    // Se conservan los usuarios guardados y el fallback original.
    const users: UserWithSanction[] =
      storedUsers.length > 0
        ? storedUsers
        : initialUsers;

    // Contador de intentos fallidos de esta cuenta.
    const guardKey = getGuardKey(users, cleanIdentifier);

    // Bloqueo por intentos fallidos.
    if (isLoginLocked(guardKey)) {
      setError(LOCKED_MESSAGE);
      return;
    }

    const user = users.find((u) => {
      const matchIdentity =
        u.email.toLowerCase() === cleanIdentifier ||
        u.name.toLowerCase() === cleanIdentifier;

      const matchPassword = u.password === btoa(password);

      return matchIdentity && matchPassword;
    });

    if (!user) {
      registerFailedLogin(guardKey);
      setError('Credenciales incorrectas');
      return;
    }

    // Credenciales correctas: limpiar contador de intentos.
    clearLoginAttempts(guardKey);

    // Baneo permanente: el motivo aparece debajo del mensaje.
    if (user.banned) {
      const reason =
        user.sanctionReason?.trim() ||
        'Incumplimiento de las normas de la comunidad.';

      setError(
        `Cuenta bloqueada permanentemente.\nMotivo: ${reason}`
      );
      return;
    }

    // Suspensión temporal: el motivo aparece debajo del mensaje.
    if (
      user.suspendedUntil &&
      user.suspendedUntil > Date.now()
    ) {
      const reason =
        user.sanctionReason?.trim() ||
        'Incumplimiento de las normas de la comunidad.';

      setError(
        `Cuenta suspendida temporalmente.\nMotivo: ${reason}`
      );
      return;
    }

    // Normalizar el rol antes de iniciar sesión.
    const cleanUser: User = {
      ...user,
      role: String(user.role).toLowerCase().trim() as User['role']
    };

    onLoginSuccess(cleanUser);
  };

  return (
    <div className="auth-container">

      <h2>Iniciar Sesión</h2>

      {/* Mostrar el error respetando los saltos de línea */}
      {error && (
        <p
          className="error"
          style={{ whiteSpace: 'pre-line' }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleLogin}>

        <div>
          <label>Correo o usuario</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div>
          <label>Contraseña</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
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

        <button type="submit">Entrar</button>
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
