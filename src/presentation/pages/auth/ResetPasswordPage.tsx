import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PasswordStrengthMeter } from "../../components/auth/PasswordStrengthMeter";
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  getPasswordStrength
} from "../../../business/services/passwordStrength";

export function ResetPasswordPage({ onFinish }: { onFinish: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 email seguro: se lee una sola vez al crear el estado (sin useEffect)
  const [email] = useState<string | null>(() =>
    localStorage.getItem("reset_email")
  );

  const { strength, strengthLabel } = getPasswordStrength(newPassword);

  const findUserIndex = (users: any[], email: string) => {
    return users.findIndex(
      (u) =>
        (u.email || "").toLowerCase().trim() ===
        email.toLowerCase().trim()
    );
  };

  const handleReset = () => {
    if (!email) {
      setMessage("❌ No hay sesión de recuperación activa");
      return;
    }

    if (newPassword.trim().length < MIN_PASSWORD_LENGTH) {
      setMessage(
        `❌ La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      );
      return;
    }

    const stored = localStorage.getItem("app_users");
    const users = stored ? JSON.parse(stored) : [];

    const index = findUserIndex(users, email);

    // ❌ usuario no encontrado
    if (index === -1) {
      setMessage("❌ Usuario no encontrado en base de datos");
      return;
    }

    // 🔥 actualizar usuario
    users[index] = {
      ...users[index],
      password: btoa(newPassword.trim()),
    };

    localStorage.setItem("app_users", JSON.stringify(users));

    // 🧹 limpiar sesión de reset
    localStorage.removeItem("reset_email");

    setMessage("✔ Contraseña actualizada correctamente");

    // 🔁 redirigir automático
    setTimeout(() => {
      onFinish();
    }, 1000);
  };

  return (
    <div className="auth-fixed">
      <div className="auth-container">

        <h2>Nueva contraseña</h2>

        {message && <p className="success">{message}</p>}

        {!email ? (
          <p style={{ color: "red" }}>
            No hay proceso de recuperación activo
          </p>
        ) : (
          <>
            <p style={{ fontSize: "13px" }}>
              Recuperando cuenta de: <b>{email}</b>
            </p>

            <div className="register-field" style={{ marginBottom: 15 }}>
              <label htmlFor="reset-password">Nueva contraseña</label>

              <div className="password-wrapper">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Escribe tu nueva contraseña"
                  autoComplete="new-password"
                  maxLength={MAX_PASSWORD_LENGTH}
                />

                <button
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <small className="register-help">
                Entre {MIN_PASSWORD_LENGTH} y {MAX_PASSWORD_LENGTH} caracteres.
                Se recomienda combinar mayúsculas, minúsculas, números y símbolos.
              </small>

              <PasswordStrengthMeter
                strength={strength}
                strengthLabel={strengthLabel}
              />
            </div>

            <button onClick={handleReset}>
              Cambiar contraseña
            </button>
          </>
        )}
      </div>
    </div>
  );
}