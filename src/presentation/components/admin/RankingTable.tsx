import type { RankingRow } from "../../../data/repositories/activity";
import { MEDALS } from "./admin-utils";

interface RankingTableProps {
  rows: RankingRow[];
}

export function RankingTable({ rows }: RankingTableProps) {
  // el que más acciones tiene marca el 100% de la barra
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <div className="rank-table-wrap">
      <table className="rank-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Publicaciones</th>
            <th>Comentarios</th>
            <th>Likes</th>
            <th>Seguidos</th>
            <th>Moderadas</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={r.user.id}>
              <td>{MEDALS[i] ?? i + 1}</td>

              <td>
                <div className="rank-user">
                  <div className="rank-avatar">
                    {r.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{r.user.name}</strong>
                    <span>{r.user.email}</span>
                  </div>
                </div>
              </td>

              <td><span className={`pill ${r.user.role}`}>{r.user.role}</span></td>
              <td>{r.post}</td>
              <td>{r.comment}</td>
              <td>{r.like}</td>
              <td>{r.follow}</td>
              <td>{r.moderation}</td>

              <td>
                <div className="rank-total">
                  <div className="rank-bar">
                    <div
                      className="rank-bar-fill"
                      style={{ width: `${(r.total / max) * 100}%` }}
                    />
                  </div>
                  <b>{r.total}</b>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
