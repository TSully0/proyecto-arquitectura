import type { ManagedAccount } from "../../../data/repositories/sanctions";

export type Role = "admin" | "moderator" | "user";

export type StatusFilter =
  | "all"
  | "ACTIVO"
  | "sanctioned"
  | "SUSPENDIDO"
  | "BANEADO";

// Valores que acepta ?estado= en la dirección (los usa la tarjeta del Resumen)
export const STATUS_PARAMS: Record<string, StatusFilter> = {
  activos: "ACTIVO",
  sancionados: "sanctioned",
  suspendidos: "SUSPENDIDO",
  baneados: "BANEADO",
};

// Usuario con su estado de sanción; viene de Supabase (ver data/repositories/sanctions.ts).
export type ManagedUser = ManagedAccount;