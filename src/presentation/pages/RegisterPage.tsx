import { useState } from 'react';
import { initialUsers } from '../../data/repositories/users';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

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

    const stored = localStorage.getItem('app_users');
    const users = stored ? JSON.parse(stored) : initialUsers;

    // 🔹 evitar duplicados
    const exists = users.some(
      (u: any) => u.email.toLowerCase() === cleanEmail
    );

    if (exists) {
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

        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tienes cuenta?{' '}
        <button onClick={onNavigateToLogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
}