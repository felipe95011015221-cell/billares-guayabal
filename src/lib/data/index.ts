import "server-only";
import { modoDatos } from "../env";
import { demoStore } from "./demo-store";
import { supabaseStore } from "./supabase-store";
import type { Repositorio } from "./repository";

export { ErrorNegocio } from "./repository";

/** Devuelve el repositorio activo, o null si no hay persistencia configurada (producción sin Supabase). */
export function repo(): Repositorio | null {
  const modo = modoDatos();
  if (modo === "supabase") return supabaseStore;
  if (modo === "demo") return demoStore;
  return null;
}

export function repoOError(): Repositorio {
  const r = repo();
  if (!r) throw new Error("La base de datos no está configurada.");
  return r;
}
