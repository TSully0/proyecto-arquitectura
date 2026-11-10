import { useState } from "react";
import { emailExistsInSupabase } from "../../../data/repositories/users";
import { OtpInput } from "../../components/auth/OtpInput";
import { useResendTimer } from "../../hooks/useResendTimer";
import { AuthLayout } from "../../layouts/AuthLayout";

type Step = "email" | "code" | "verified";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({
  onBack
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const {
    isActive,
    startTimer,
    clearTimer,
    formattedTime
  } = useResendTimer();

  // ================= GENERAR CÓDIGO =================

  const generateNewCode = () => {
    const newCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    setGeneratedCode(newCode);
    setCode("");

    startTimer();

    // Solo para pruebas locales.
    console.log(
      `Código generado para ${email}: ${newCode}`
    );
  };

  // ================= ENVIAR CÓDIGO =================

  const sendCode = async () => {
    if (sending) return;

    if (!email.trim()) {
      setMessage("Ingresa un correo.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const exists = await emailExistsInSupabase(
        email.trim()
      );

      if (exists === null) {
        setMessage(
          "No se pudo verificar el correo. Revisa tu conexión."
        );
        return;
      }

      if (!exists) {
        setMessage("Este correo no está registrado.");
        return;
      }

      generateNewCode();

      setStep("code");
      setMessage(
        "Código generado correctamente. Revisa la consola."
      );
    } catch {
      setMessage(
        "Ocurrió un error al verificar el correo."
      );
    } finally {
      setSending(false);
    }
  };

  // ================= REENVIAR CÓDIGO =================

  const resendCode = () => {
    if (isActive || sending) return;

    generateNewCode();

    setMessage(
      "Se generó un nuevo código. Revisa la consola."
    );
  };

  // ================= VERIFICAR CÓDIGO =================

  const verifyCode = () => {
    if (!code.trim()) {
      setMessage("Ingresa el código.");
      return;
    }

    if (code.length !== 6) {
      setMessage("El código debe tener 6 dígitos.");
      return;
    }

    if (code === generatedCode) {
      setMessage("✔ Código correcto.");

      localStorage.setItem(
        "reset_email",
        email.trim().toLowerCase()
      );

      setStep("verified");
      clearTimer();
    } else {
      setMessage(
        "Código incorrecto. Inténtalo nuevamente."
      );
    }
  };

  // ================= ESTADO DE MENSAJES =================

  const isSuccess =
    message.startsWith("✔") ||
    message.startsWith("Código generado") ||
    message.startsWith("Se generó un nuevo código");

  // ================= INTERFAZ =================

  return (
    <AuthLayout>

      <h2>Recuperar contraseña</h2>

      {message && (
        <p className={isSuccess ? "success" : "error"}>
          {message}
        </p>
      )}

      {/* CORREO */}

      {step === "email" && (
        <>
          <label htmlFor="recovery-email">
            Correo registrado
          </label>

          <input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@gmail.com"
            autoComplete="email"
          />

          <button
            type="button"
            onClick={sendCode}
            disabled={sending}
          >
            {sending
              ? "Verificando..."
              : "Enviar código"}
          </button>
        </>
      )}

      {/* CÓDIGO */}

      {step === "code" && (
        <>
          <p className="otp-email-info">
            Hemos generado un código de verificación para:
            <strong> {email}</strong>
          </p>

          <label>
            Ingresa el código de 6 dígitos
          </label>

          <OtpInput onChange={setCode} />

          <button
            type="button"
            onClick={verifyCode}
            disabled={code.length !== 6}
          >
            Verificar código
          </button>

          {/* REENVIAR CÓDIGO */}

          <div className="resend-code-container">
            <p>¿No recibiste el código?</p>

            {isActive ? (
              <>
                <p className="resend-countdown">
                  Podrás solicitar otro código en
                </p>

                <strong className="resend-timer">
                  {formattedTime}
                </strong>
              </>
            ) : (
              <button
                type="button"
                className="resend-code-btn"
                onClick={resendCode}
                disabled={sending}
              >
                Reenviar código
              </button>
            )}
          </div>
        </>
      )}

      {/* VERIFICADO */}

      {step === "verified" && (
        <>
          <p
            style={{
              color: "#16a34a",
              fontWeight: "bold"
            }}
          >
            ✔ Identidad verificada
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.assign("/reset-password")
            }
          >
            Cambiar contraseña
          </button>
        </>
      )}

      {/* VOLVER */}

      <button
        type="button"
        onClick={onBack}
        style={{ marginTop: 15 }}
      >
        Volver al login
      </button>

    </AuthLayout>
  );
}