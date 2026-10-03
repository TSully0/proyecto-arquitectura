import { useState } from "react";

type Step = "email" | "code" | "verified";

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
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />

          <button onClick={verifyCode}>
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
  );
}