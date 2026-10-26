import type { User } from "../../../business/types/user";

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

export type ManagedUser = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
  sanctionCategory?: string;
  suspensionLabel?: string;
  liftedNotice?: "suspension" | "ban";
  liftedBy?: string;
};
