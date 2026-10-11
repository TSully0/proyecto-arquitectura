import type { User } from "../../../business/types/user";

export function ProfileAbout({ user }: { user: User }) {
  return (
    <section className="profile-section">
      <h2>Sobre mí</h2>
      <div className="profile-info-card">
        <p>
          <strong>Nombre:</strong> {user.name}
        </p>
        <p>
          <strong>Correo:</strong> {user.email}
        </p>
        <p>
          <strong>Estado:</strong> {user.banned ? "Bloqueado" : "Activo"}
        </p>
      </div>
    </section>
  );
}
