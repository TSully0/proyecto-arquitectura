import { useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";

type Step = "email" | "code" | "verified";

// ================= CASILLAS DE CÓDIGO (estilo Supercell ID) =================
function OtpInput({
  length = 6,
  onChange
}: {
  length?: number;
  onChange: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  const focusAt = (index: number) => {
    refs.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
  };

  // Escribe uno o varios dígitos a partir de una casilla (sirve para tipear y pegar).
  const fillFrom = (start: number, text: string) => {
    const onlyDigits = text.replace(/\D/g, "");
    if (!onlyDigits) return;

    const next = [...digits];
    let position = start;

    for (const char of onlyDigits) {
      if (position >= length) break;
      next[position] = char;
      position += 1;
    }

    update(next);
    focusAt(position);
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (!raw) {
      const next = [...digits];
      next[index] = "";
      update(next);
      return;
    }

    const onlyDigits = raw.replace(/\D/g, "");
    fillFrom(onlyDigits.length >= length ? 0 : index, onlyDigits);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      update(next);
      focusAt(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(0, e.clipboardData.getData("text"));
  };

  return (
    <div className="otp-group">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className={`otp-input${digit ? " filled" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Dígito ${index + 1} de ${length}`}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}

export function ForgotPasswordPage({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [message, setMessage] = useState("");

  // 🔍 buscar usuario en "base de datos local"
  const findUserByEmail = (email: string) => {
    const stored = localStorage.getItem("app_users");
    const users = stored ? JSON.parse(stored) : [];
    return users.find(
      (u: any) =>
        (u.email || "").toLowerCase().trim() ===
        email.toLowerCase().trim()
    );
  };

  // ================= ENVIAR CÓDIGO =================
  const sendCode = () => {
    if (!email.trim()) {
      setMessage("Ingresa un correo");
      return;
    }

    const user = findUserByEmail(email);

    // ❌ email no existe en BD
    if (!user) {
      setMessage("Este correo no está registrado");
      return;
    }

    const newCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    setGeneratedCode(newCode);

    console.log(`📩 Código enviado a ${email}: ${newCode}`);

    setMessage("Código enviado (revisa consola)");
    setStep("code");
  };

  // ================= VERIFICAR CÓDIGO =================
  const verifyCode = () => {
    if (!code.trim()) {
      setMessage("Ingresa el código");
      return;
    }

    if (code === generatedCode) {
      setMessage("✔ Código correcto");

      // guardamos email verificado
      localStorage.setItem("reset_email", email);

      setStep("verified");
    } else {
      setMessage("Código incorrecto");
    }
  };

  return (
    <div className="auth-fixed">
      <div className="auth-container">

        <h2>Recuperar contraseña</h2>

        {message && <p className="success">{message}</p>}

        {/* ================= EMAIL ================= */}
        {step === "email" && (
          <>
            <label>Correo registrado</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@gmail.com"
            />

            <button onClick={sendCode}>
              Enviar código
            </button>
          </>
        )}

        {/* ================= CÓDIGO ================= */}
        {step === "code" && (
          <>
            <label>Ingresa código de 6 dígitos</label>
            <OtpInput onChange={setCode} />

            <button onClick={verifyCode} disabled={code.length < 6}>
              Verificar código
            </button>
          </>
        )}

        {/* ================= VERIFICADO ================= */}
        {step === "verified" && (
          <>
            <p style={{ color: "green", fontWeight: "bold" }}>
              ✔ Identidad verificada
            </p>

            <button
              onClick={() =>
                window.location.assign("/reset-password")
              }
            >
              Cambiar contraseña
            </button>
          </>
        )}

        {/* BACK */}
        <button onClick={onBack} style={{ marginTop: 15 }}>
          Volver al login
        </button>
      </div>
    </div>
  );
}