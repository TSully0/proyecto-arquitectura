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

    // 🔹 limpiar datos
    const cleanIdentifier = identifier.trim().toLowerCase();

    const stored = localStorage.getItem('app_users');
    const users = stored ? JSON.parse(stored) : initialUsers;

    const user = users.find(
      (u: any) =>
        (
          u.email.toLowerCase() === cleanIdentifier ||
          u.name.toLowerCase() === cleanIdentifier
        ) &&
        u.password === btoa(password)
    );

    // ❌ usuario no existe
    if (!user) {
      setError('Credenciales incorrectas');
      return;
    }

    // 🚫 usuario baneado
    if (user.banned) {
      setError('Tu cuenta ha sido bloqueada por un administrador');
      return;
    }

    // ✅ login correcto
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