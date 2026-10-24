import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

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

        <PasswordStrengthMeter
          strength={strength}
          strengthLabel={strengthLabel}
        />
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