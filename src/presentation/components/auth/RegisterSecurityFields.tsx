import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface RegisterSecurityFieldsProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  strength: number;
  strengthLabel: string;
  minPasswordLength: number;
  maxPasswordLength: number;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export function RegisterSecurityFields({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  strength,
  strengthLabel,
  minPasswordLength,
  maxPasswordLength,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword
}: RegisterSecurityFieldsProps) {
  return (
    <>
      <h3>Seguridad de la cuenta</h3>

      <div className="register-field">
        <label htmlFor="register-password">
          Contraseña
        </label>

        <div className="password-wrapper">
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="new-password"
            minLength={minPasswordLength}
            maxLength={maxPasswordLength}
            required
          />

          <button
            type="button"
            className="eye-icon"
            onClick={onTogglePassword}
            aria-label={
              showPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
            }
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <small className="register-help">
          Entre {minPasswordLength} y {maxPasswordLength} caracteres.
          Se recomienda combinar mayúsculas, minúsculas, números y símbolos.
        </small>

        <div
          className="register-strength-bars"
          aria-label={`Seguridad de la contraseña: ${strengthLabel}`}
        >
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className="register-strength-bar"
              style={{
                background:
                  strength >= level
                    ? level === 1
                      ? '#ef4444'
                      : level === 2
                        ? '#f59e0b'
                        : '#10b981'
                    : '#e5e7eb'
              }}
            />
          ))}
        </div>

        <small className="register-help">
          Seguridad: {strengthLabel}
        </small>
      </div>

      <div className="register-field">
        <label htmlFor="register-confirm-password">
          Confirmar contraseña
        </label>

        <div className="password-wrapper">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) =>
              onConfirmPasswordChange(e.target.value)
            }
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="eye-icon"
            onClick={onToggleConfirmPassword}
            aria-label={
              showConfirmPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
            }
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
    </>
  );
}