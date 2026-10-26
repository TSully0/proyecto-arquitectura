/* Mensaje corto mientras se descarga una pantalla (paneles con carga perezosa). */
export function PageLoader({ text = "Cargando..." }: { text?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        padding: 24,
        color: "#7b6a58",
        fontSize: 14,
        fontWeight: 600
      }}
    >
      {text}
    </div>
  );
}
