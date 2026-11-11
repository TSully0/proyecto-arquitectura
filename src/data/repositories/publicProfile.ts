import { supabase } from "../supabase";
import type { CommunityUser } from "../../business/types/profile";

/*
  Datos de otras personas para mostrar en pantalla.
  OJO: aquí nunca se lee passwordHash.
*/

export type PublicProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "user";
  createdAt: string | null;
};

export type UserBasic = Pick<PublicProfile, "id" | "name" | "role">;
export type UserSearchResult = UserBasic & { email: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toFrontRole = (role: unknown): PublicProfile["role"] => {
  const value = String(role).toUpperCase();
  if (value === "ADMIN") return "admin";
  if (value === "MODERATOR") return "moderator";
  return "user";
};

// Devuelve null si el id no existe, no es válido o es de un administrador
// (los administradores no tienen perfil público).
export async function fetchPublicProfile(id: string): Promise<PublicProfile | null> {
  if (!UUID_RE.test(id)) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, fullName, email, role, createdAt")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el perfil: ${error.message}`);
  }
  if (!data) return null;

  const role = toFrontRole(data.role);
  if (role === "admin") return null;

  return {
    id: String(data.id),
    name: String(data.fullName ?? ""),
    email: String(data.email ?? ""),
    role,
    createdAt: data.createdAt ? String(data.createdAt) : null
  };
}

// Busca personas por nombre o por correo (sin administradores). Mínimo 2 letras.
export async function searchUsers(term: string): Promise<UserSearchResult[]> {
  // se quitan los caracteres que tienen significado especial en el filtro
  const clean = term.trim().replace(/[,()%\\"*]/g, " ").trim();
  if (clean.length < 2) return [];

  const { data, error } = await supabase
    .from("users")
    .select("id, fullName, email, role")
    .or(`fullName.ilike.%${clean}%,email.ilike.%${clean}%`)
    .neq("role", "ADMIN")
    .order("fullName", { ascending: true })
    .limit(8);

  if (error) {
    throw new Error(`No se pudo buscar personas: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.fullName ?? ""),
    email: String(row.email ?? ""),
    role: toFrontRole(row.role)
  }));
}

// Nombre y rol de varias personas a la vez (por ejemplo, quienes enviaron solicitudes).
export async function fetchUsersByIds(ids: string[]): Promise<UserBasic[]> {
  const valid = Array.from(new Set(ids.filter((id) => UUID_RE.test(id))));
  if (valid.length === 0) return [];

  const { data, error } = await supabase
    .from("users")
    .select("id, fullName, role")
    .in("id", valid);

  if (error) {
    throw new Error(`No se pudieron cargar las personas: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.fullName ?? ""),
    role: toFrontRole(row.role)
  }));
}

// Personas reales para la sección "Comunidad" (sin administradores y sin mí).
export async function fetchCommunityPeople(
  myEmail: string,
  limit = 30
): Promise<CommunityUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, fullName, role")
    .neq("role", "ADMIN")
    .neq("email", myEmail)
    .order("fullName", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`No se pudo cargar la comunidad: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.fullName ?? ""),
    role: toFrontRole(row.role)
  }));
}