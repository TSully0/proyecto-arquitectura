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
    const storedUsers: User[] = stored ? JSON.parse(stored) : [];

    // ✅ SOLUCIÓN SIMPLE Y ESTABLE (SIN MERGE BUGS)
    const users: User[] = storedUsers.length > 0 ? storedUsers : initialUsers;

    // 🔒 contador de intentos de ESTA cuenta en ESTE navegador
    const guardKey = getGuardKey(users, cleanIdentifier);

    // si ya está bloqueada, ni se revisa la contraseña
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
      // mismo mensaje de siempre: no se avisa de intentos ni de bloqueo
      registerFailedLogin(guardKey);
      setError('Credenciales incorrectas');
      return;
    }

    // credenciales correctas → se borra el contador de esa cuenta
    clearLoginAttempts(guardKey);

    if (user.banned) {
      setError('Cuenta bloqueada permanentemente');
      return;
    }

    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      setError('Cuenta suspendida temporalmente');
      return;
    }

    // 🔥 normalizar antes de enviar
    const cleanUser: User = {
      ...user,
      role: String(user.role).toLowerCase().trim() as User['role']
    };

    onLoginSuccess(cleanUser);
  };

  return (
    <div className="auth-container">

      <h2>Iniciar Sesión</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>

        <div>
          <label>Correo o usuario</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
              required
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button type="submit">Entrar</button>
      </form>

      <p>
        <button type="button" onClick={onNavigateToForgotPassword}>
          ¿Olvidaste tu contraseña?
        </button>
      </p>

      <p>
        ¿No tienes cuenta?{' '}
        <button onClick={onNavigateToRegister}>
          Regístrate
        </button>
      </p>

    </div>
  );
}
