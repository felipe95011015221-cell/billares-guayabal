import "server-only";

/**
 * Modo de datos:
 *  - "supabase": NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY definidos -> persistencia real.
 *  - "demo":     sin Supabase y en desarrollo -> archivo local .data/demo-db.json con datos ficticios.
 *  - "inactivo": sin Supabase en producción -> los formularios NO simulan funcionar; se ofrece WhatsApp.
 */
export type ModoDatos = "supabase" | "demo" | "inactivo";

export function modoDatos(): ModoDatos {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true") return "demo";
  return "inactivo";
}

export function secretoSesion(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}
