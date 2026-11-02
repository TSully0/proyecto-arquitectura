import { OtpInput } from './OtpInput';

interface RegisterVerifyStepProps {
  email: string;
  code: string;
  // Cambia cada vez que se genera un código nuevo, para limpiar las casillas.
  otpKey: number;
  isActive: boolean;
  formattedTime: string;
  submitting: boolean;
  success: boolean;
  onCodeChange: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
}

// Paso 3 del registro: verificación del correo con código de 6 dígitos.
export function RegisterVerifyStep({
  email,
  code,
  otpKey,
  isActive,
  formattedTime,
  submitting,
  success,
  onCodeChange,
  onResend,
  onBack
}: RegisterVerifyStepProps) {
  return (
    <>
      <p className="otp-email-info">
        Hemos generado un código de verificación para:
        <strong> {email}</strong>
      </p>

      <label>Ingresa el código de 6 dígitos</label>

      <OtpInput key={otpKey} onChange={onCodeChange} />

      <div className="resend-code-container">
        <p>¿No recibiste el código?</p>

        {isActive ? (
          <>
            <p className="resend-countdown">
              Podrás solicitar otro código en
            </p>
            <strong className="resend-timer">{formattedTime}</strong>
          </>
        ) : (
          <button
            type="button"
            className="resend-code-btn"
            onClick={onResend}
            disabled={submitting || success}
          >
            Reenviar código
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={code.length !== 6 || submitting || success}
        style={{ marginTop: 15 }}
      >
        {submitting ? 'Creando cuenta...' : 'Verificar y crear cuenta'}
      </button>

      <button
        type="button"
        className="register-back-btn"
        onClick={onBack}
        disabled={submitting || success}
      >
        Atrás
      </button>
    </>
  );
}