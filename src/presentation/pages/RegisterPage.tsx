import { useState } from 'react';
import { initialUsers, syncUserToSupabase } from '../../data/repositories/users';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

// 🔹 lee los usuarios con la MISMA lógica que el login
const getUsers = (): any[] => {
  try {
    const stored = localStorage.getItem('app_users');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialUsers;
  } catch {
    return initialUsers;
  }
};

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // evita registrar dos veces si se pulsa de nuevo
    if (success) return;

    // 🔹 limpiar espacios
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 🔹 SOLO 3 DOMINIOS PERMITIDOS
    const validDomains = ['@gmail.com', '@hotmail.com', '@email.com'];
    const isValid = validDomains.some(d => cleanEmail.endsWith(d));

    if (!isValid) {
      setError('Correo inválido (usa Gmail, Hotmail o Email.com)');
      return;
    }

    // 🔹 validación básica
    if (cleanName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener mínimo 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const users = getUsers();

    // 🔹 CORREO ÚNICO (el nombre sí puede repetirse)
    const emailExists = users.some(
      (u: any) => (u.email || '').trim().toLowerCase() === cleanEmail
    );

    if (emailExists) {
      setError('Este correo ya está registrado');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: cleanName,
      email: cleanEmail,
      password: btoa(password),
      role: 'user',
      banned: false
    };

    const updated = [...users, newUser];
    localStorage.setItem('app_users', JSON.stringify(updated));

    // Sincronizar en Supabase en segundo plano
    syncUserToSupabase(newUser).catch((err) =>
      console.warn('Background Supabase user sync:', err)
    );

    setSuccess(true);

    // limpiar campos
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      onNavigateToLogin();
    }, 1500);
  };

  return (
    <div className="auth-container">
      <h2>Crear Cuenta</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">Usuario creado correctamente</p>}

      <form onSubmit={handleRegister}>

        <div>
          <label>Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div>
          <label>Confirmar contraseña</label>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={success}>
          Registrarse
        </button>
      </form>

      <p>
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onNavigateToLogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
}
