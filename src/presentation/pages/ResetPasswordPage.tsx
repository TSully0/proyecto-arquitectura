import { useState, useEffect } from "react";

export function ResetPasswordPage({ onFinish }: { onFinish: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 🔥 cargar email seguro
  useEffect(() => {
    const storedEmail = localStorage.getItem("reset_email");
    setEmail(storedEmail);
  }, []);

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

    if (newPassword.trim().length < 4) {
      setMessage("❌ La contraseña es muy corta");
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

    // 🔁 opcional: redirigir automático
    setTimeout(() => {
      onFinish();
    }, 1000);
  };

  return (
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

          <label>Nueva contraseña</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Escribe tu nueva contraseña"
          />

          <button onClick={handleReset}>
            Cambiar contraseña
          </button>
        </>
      )}
    </div>
  );
}