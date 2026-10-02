import { useState } from 'react';
import { initialUsers } from '../../data/repositories/users';
import type { User } from '../../business/types/user';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (user: User) => void;
}

export function LoginPage({
  onNavigateToRegister,
  onLoginSuccess
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
    const storedUsers = stored ? JSON.parse(stored) : [];
    const users = [
      ...initialUsers.map((initialUser) => {
        const storedUser = storedUsers.find(
          (candidate: User) =>
            candidate.email.toLowerCase() === initialUser.email.toLowerCase()
        );

        return storedUser
          ? {
              ...initialUser,
              ...storedUser,
              password: initialUser.password
            }
          : initialUser;
      }),
      ...storedUsers.filter(
        (storedUser: User) =>
          !initialUsers.some(
            (initialUser) =>
              initialUser.email.toLowerCase() === storedUser.email.toLowerCase()
          )
      ),
    ];

    const user = users.find(
      (u: User) =>
        (
          u.email.toLowerCase() === cleanIdentifier ||
          u.name.toLowerCase() === cleanIdentifier
        ) &&
        u.password === btoa(password)
    );

    if (!user) {
      setError('Credenciales incorrectas');
      return;
    }

    // 🚫 BAN PERMANENTE
    if (user.banned) {
      setError('Cuenta bloqueada permanentemente');
      return;
    }

    // ⏳ SUSPENSIÓN
    if (
      user.suspendedUntil &&
      new Date(user.suspendedUntil) > new Date()
    ) {
      setError('Cuenta suspendida temporalmente');
      return;
    }

    onLoginSuccess(user);
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
        ¿No tienes cuenta?{' '}
        <button onClick={onNavigateToRegister}>
          Regístrate
        </button>
      </p>
    </div>
  );
}