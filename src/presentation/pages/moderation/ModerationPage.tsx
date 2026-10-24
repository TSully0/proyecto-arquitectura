import { useState } from "react";
import { MessageSquare, Clock, CheckCircle, Trash2 } from "lucide-react";

import { PageHeader } from "../../components/admin/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { FilterTabs } from "../../components/admin/FilterTabs";

type Review = {
  id: string;
  user: string;
  text: string;
  approved: boolean;
};

type Filter = "all" | "pending" | "approved";

const INITIAL_REVIEWS: Review[] = [
  { id: "1", user: "Ana G.", text: "Muy buen lugar 🔥", approved: false },
  { id: "2", user: "Carlos", text: "No me gustó 😐", approved: false },
  { id: "3", user: "María", text: "Spam spam 😡", approved: false }
];

export const ModerationPage = () => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [removed, setRemoved] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  const pending = reviews.filter((r) => !r.approved).length;
  const approved = reviews.length - pending;

  const visible = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const handleApprove = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setRemoved((count) => count + 1);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="🛠️ Panel de moderación"
        subtitle="Administra reseñas y controla el contenido de la comunidad"
      />

      <div className="admin-stats">
        <StatCard tone="blue" icon={<MessageSquare size={20} />} value={reviews.length} label="Reseñas en cola" />
        <StatCard tone="brown" icon={<Clock size={20} />} value={pending} label="Pendientes" />
        <StatCard tone="green" icon={<CheckCircle size={20} />} value={approved} label="Aprobadas" />
        <StatCard tone="red" icon={<Trash2 size={20} />} value={removed} label="Eliminadas" />
      </div>

      <div className="admin-panel">
        <div className="mod-toolbar">
          <h2>Reseñas</h2>

          <FilterTabs<Filter>
            options={[
              { value: "all", label: "Todas" },
              { value: "pending", label: "Pendientes" },
              { value: "approved", label: "Aprobadas" }
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>

        {visible.length === 0 ? (
          <p className="admin-empty">No hay reseñas en esta lista.</p>
        ) : (
          <div className="mod-grid">
            {visible.map((r) => (
              <article
                key={r.id}
                className={`mod-card${r.approved ? " approved" : ""}`}
              >
                <div className="mod-card-head">
                  <div className="mod-avatar">{r.user.charAt(0)}</div>

                  <div>
                    <strong>{r.user}</strong>
                    <span className={`mod-status${r.approved ? " ok" : ""}`}>
                      {r.approved ? "✔ Aprobada" : "Pendiente"}
                    </span>
                  </div>
                </div>

                <p className="mod-text">{r.text}</p>

                <div className="mod-actions">
                  {!r.approved && (
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => handleApprove(r.id)}
                    >
                      Aprobar
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() => handleDelete(r.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};