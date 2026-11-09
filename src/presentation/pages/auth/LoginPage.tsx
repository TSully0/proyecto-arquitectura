import { useEffect, useState } from 'react';
import { initialUsers, loginWithSupabase } from '../../../data/repositories/users';
import { clearLiftedNotice } from '../../../data/repositories/sanctions';
import type { User } from '../../../business/types/user';
import { getGuardKey, isLoginLocked, registerFailedLogin, clearLoginAttempts } from '../../../business/services/loginGuard';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BanNotice, LiftedNotice, SuspensionCard, type SuspensionNotice } from '../../components/auth/SanctionNotices';
import { DEFAULT_REASON,MSG_LOCKED, MSG_LOCKED_NOW, encodePassword, getRemainingSeconds } from '../../../business/services/loginHelpers';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (user: User) => void;
  onNavigateToForgotPassword: () => void;
}

// Solo añade lo que User no tiene. Ideal: mover sanctionReason a la interfaz User.
type UserWithSanction = User & {
  sanctionReason?: string;
  sanctionCategory?: string;
  suspensionLabel?: string;
  liftedNotice?: 'suspension' | 'ban';
  liftedBy?: string;
};

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
  const [suspension, setSuspension] = useState<SuspensionNotice | null>(null);
  const [banReason, setBanReason] = useState<string | null>(null);
  const [suspensionEnded, setSuspensionEnded] = useState(false);
  const [liftedMessage, setLiftedMessage] = useState<string | null>(null);

  // Actualiza la cuenta regresiva del bloqueo.
  useEffect(() => {
    if (!guardKey) {
      setRemainingSeconds(0);
      return;
    }

    const updateLock = () => {
      if (!isLoginLocked(guardKey)) {
        setRemainingSeconds(0);
        setError((previous) =>
          previous === MSG_LOCKED || previous === MSG_LOCKED_NOW ? '' : previous
        );
        return;
      }

      setRemainingSeconds(getRemainingSeconds(guardKey));
    };

    updateLock();
    const interval = window.setInterval(updateLock, 250);

    return () => window.clearInterval(interval);
  }, [guardKey]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuspension(null);
    setBanReason(null);
    setSuspensionEnded(false);
    setLiftedMessage(null);

    const cleanIdentifier = identifier.trim().toLowerCase();

    let storedUsers: UserWithSanction[] = [];

    try {
      const stored = localStorage.getItem('app_users');
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
      setRemainingSeconds(getRemainingSeconds(key));
      setError(MSG_LOCKED);
      return;
    }

    // Buscar usuario y verificar la contraseña.
    const encoded = encodePassword(password);

    let user: UserWithSanction | undefined;

    if (encoded !== null) {
      // 1) Supabase manda: si la cuenta existe allí, solo vale la clave de la base de datos.
      const remote = await loginWithSupabase(cleanIdentifier, encoded);

      if (remote.status === 'ok') {
        const local = users.find(
          (u) => u.email.trim().toLowerCase() === remote.user.email.trim().toLowerCase()
        );

        // Supabase manda también en las sanciones: baneo, suspensión y avisos salen de la base de datos.
        user = {
          ...local,
          ...remote.user
        };

        // Sin duplicados: una sola copia local por correo.
        try {
          localStorage.setItem(
            'app_users',
            JSON.stringify([
              ...users.filter(
                (u) =>
                  u.email.trim().toLowerCase() !==
                  remote.user.email.trim().toLowerCase()
              ),
              user
            ])
          );
        } catch {
          /* si no se puede guardar, la sesión igual continúa */
        }
      } else if (remote.status === 'not_found' || remote.status === 'error') {
        // 2) Solo si la cuenta NO existe en Supabase (o no hay conexión) se usa la copia local.
        user = users.find(
          (u) =>
            (u.email.trim().toLowerCase() === cleanIdentifier ||
              u.name.trim().toLowerCase() === cleanIdentifier) &&
            u.password === encoded
        );
      }
      // wrong_password: la cuenta existe en Supabase y la clave no coincide → no entra.
    }

    if (!user) {
      registerFailedLogin(key);

      if (isLoginLocked(key)) {
        setRemainingSeconds(getRemainingSeconds(key));
        setError(MSG_LOCKED_NOW);
      } else {
        setRemainingSeconds(0);
        setError('Credenciales incorrectas.');
      }

      return;
    }

    // Comprobar las sanciones administrativas.
    const reason = user.sanctionReason?.trim() || DEFAULT_REASON;

    if (user.banned) {
      setBanReason(reason);
      return;
    }

    if (user.suspendedUntil && user.suspendedUntil > Date.now()) {
      setSuspension({
        until: user.suspendedUntil,
        label: user.suspensionLabel?.trim() || '',
        category: user.sanctionCategory?.trim() || '',
        reason
      });
      return;
    }

    // Si alguien le quitó una sanción, se avisa una sola vez antes de entrar.
    if (user.liftedNotice) {
      const who = user.liftedBy === 'moderator' ? 'Un moderador' : 'Un administrador';
      const what = user.liftedNotice === 'ban' ? 'tu baneo' : 'tu suspensión';

      try {
        localStorage.setItem(
          'app_users',
          JSON.stringify(
            users.map((u) =>
              u.id === user.id
                ? { ...u, liftedNotice: undefined, liftedBy: undefined }
                : u
            )
          )
        );
      } catch {
        /* si no se puede guardar, el aviso saldrá otra vez */
      }

      // El aviso se muestra una sola vez: también se borra en la base de datos.
      await clearLiftedNotice(user.id);

      clearLoginAttempts(key);
      setRemainingSeconds(0);
      setLiftedMessage(`${who} levantó ${what}.`);
      return;
    }

    // Limpiar intentos después de un inicio de sesión correcto.
    clearLoginAttempts(key);
    setRemainingSeconds(0);

    const cleanUser: User = {
      ...user,
      role: String(user.role).toLowerCase().trim() as User['role']
    };

    try {
      onLoginSuccess(cleanUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
      );
    }
  };

  return (
    <div className="auth-fixed">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>

        {error && (
          <p className="error" role="alert" style={{ whiteSpace: 'pre-line' }}>
            {error}

            {remainingSeconds > 0 && (
              <span>
                {'\n'}Puedes intentarlo nuevamente en{' '}
                <strong>{remainingSeconds} s</strong>.
              </span>
            )}
          </p>
        )}

        {liftedMessage && (
          <LiftedNotice
            title={liftedMessage}
            text="Tu cuenta ya está activa. Vuelve a presionar «Entrar» para iniciar sesión."
          />
        )}

        {suspensionEnded && (
          <LiftedNotice
            title="Suspensión finalizada"
            text="Tu cuenta ya está activa. Ya puedes iniciar sesión."
          />
        )}

        {banReason !== null && <BanNotice reason={banReason} />}

        {suspension && (
          <SuspensionCard
            notice={suspension}
            onEnd={() => {
              setSuspension(null);
              setSuspensionEnded(true);
            }}
          />
        )}

        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="login-identifier">Correo o usuario</label>

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
            <label htmlFor="login-password">Contraseña</label>

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
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={remainingSeconds > 0}>
            {remainingSeconds > 0 ? `Bloqueado (${remainingSeconds}s)` : 'Entrar'}
          </button>
        </form>

        <p>
          <button type="button" onClick={onNavigateToForgotPassword}>
            ¿Olvidaste tu contraseña?
          </button>
        </p>

        <p>
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onNavigateToRegister}>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}