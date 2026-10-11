import type { RankingRow } from "../../../data/repositories/activity";

interface ReportSheetProps {
  title: string;
  summary: { label: string; value: number }[];
  topTitle: string;     // por ejemplo "Top 5 más activos"
  top: RankingRow[];    // ya filtrado y recortado
}

/*
  Hoja del informe: es lo que se imprime o se guarda como PDF.
  El menú lateral y los botones se ocultan solos al imprimir.
*/
export function ReportSheet({ title, summary, topTitle, top }: ReportSheetProps) {
  return (
    <div className="admin-panel report-sheet">
      <h2>{title}</h2>
      <p className="admin-subtitle">
        Generado el {new Date().toLocaleDateString("es-EC")}
      </p>

      <table className="rank-table">
        <tbody>
          {summary.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td><b>{row.value}</b></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 24 }}>{topTitle}</h2>

      {top.length === 0 ? (
        <p className="admin-empty">Sin actividad registrada todavía.</p>
      ) : (
        <table className="rank-table">
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {top.map((r, i) => (
              <tr key={r.user.id}>
                <td>{i + 1}</td>
                <td>{r.user.name}</td>
                <td>{r.user.role}</td>
                <td><b>{r.total}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
