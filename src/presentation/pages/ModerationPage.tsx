import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/moderation.css";

type Review = {
  id: string;
  user: string;
  text: string;
  approved: boolean;
};

export const ModerationPage = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([
    { id: "1", user: "Ana G.", text: "Muy buen lugar 🔥", approved: false },
    { id: "2", user: "Carlos", text: "No me gustó 😐", approved: false },
    { id: "3", user: "María", text: "Spam spam 😡", approved: false },
  ]);

  const handleApprove = (id: string) => {
    setReviews(prev =>
      prev.map(r =>
        r.id === id ? { ...r, approved: true } : r
      )
    );
  };

  const handleDelete = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  // 🔥 SOLO VOLVER A HOME (NO LOGOUT)
  const handleGoHome = () => {
    navigate("/");
  };

  // 🔥 LOGOUT REAL
  // Importante: usar window.location.replace (recarga la página) y NO navigate.
  // Con navigate, AppRouter sigue con el "user" viejo en memoria y se
  // crea un bucle infinito entre /login y /moderacion.
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("reset_email");

    window.location.replace("/login");
  };

  return (
    <div className="moderation-wrapper">
      <div className="moderation-container">

        {/* 🔘 BOTONES ARRIBA */}
        <div style={{ display: "flex", gap: "10px" }}>

          {/* VOLVER A HOME */}
          <button className="btn-back" onClick={handleGoHome}>
            ⬅ Volver a Home
          </button>

          {/* LOGOUT */}
          <button className="btn-back" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>

        </div>

        <h1>🛠️ Panel de Moderación</h1>

        <p className="subtitle">
          Administra reseñas y controla el contenido de la comunidad
        </p>

        <div className="reviews-grid">
          {reviews.map(r => (
            <div key={r.id} className={`review-card ${r.approved ? "approved" : ""}`}>
              <div className="review-header">
                <div className="avatar">{r.user.charAt(0)}</div>

                <div>
                  <p className="user">{r.user}</p>
                  <span className="status">
                    {r.approved ? "✔ Aprobado" : "Pendiente"}
                  </span>
                </div>
              </div>

              <p className="text">{r.text}</p>

              <div className="actions">
                {!r.approved && (
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(r.id)}
                  >
                    Aprobar
                  </button>
                )}

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(r.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <p className="empty">No hay reseñas pendientes</p>
        )}
      </div>
    </div>
  );
};
