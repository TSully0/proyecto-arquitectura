interface PasswordStrengthMeterProps {
  strength: number;
  strengthLabel: string;
}

const STRENGTH_COLORS = ['#ef4444', '#f59e0b', '#10b981'];
const EMPTY_COLOR = '#e5e7eb';

// Barra de 3 niveles + texto "Seguridad: ...". Se reutiliza en registro y en recuperar contraseña.
export function PasswordStrengthMeter({
  strength,
  strengthLabel
}: PasswordStrengthMeterProps) {
  return (
    <>
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
                strength >= level ? STRENGTH_COLORS[level - 1] : EMPTY_COLOR
            }}
          />
        ))}
      </div>

      <small className="register-help">Seguridad: {strengthLabel}</small>
    </>
  );
}