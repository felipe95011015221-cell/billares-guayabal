import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { modoDatos, secretoSesion } from "./env";
import { COOKIE_ADMIN, DURACION_SESION_S, firmarSesion, verificarSesion } from "./session";

export type EstadoAuth =
  | { disponible: true; metodo: "supabase" | "demo" }
  | { disponible: false; motivo: string };

/** Indica si el acceso administrativo está correctamente configurado. Nunca hay credenciales por defecto. */
export function estadoAuth(): EstadoAuth {
  if (!secretoSesion()) return { disponible: false, motivo: "Falta ADMIN_SESSION_SECRET (mínimo 32 caracteres) en las variables de entorno." };
  const modo = modoDatos();
  if (modo === "supabase") {
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { disponible: false, motivo: "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY." };
    return { disponible: true, metodo: "supabase" };
  }
  if (modo === "demo") {
    if (!process.env.ADMIN_DEMO_EMAIL || !process.env.ADMIN_DEMO_PASSWORD || process.env.ADMIN_DEMO_PASSWORD.length < 10)
      return { disponible: false, motivo: "Modo demostración: defina ADMIN_DEMO_EMAIL y ADMIN_DEMO_PASSWORD (mínimo 10 caracteres) en .env.local." };
    return { disponible: true, metodo: "demo" };
  }
  return { disponible: false, motivo: "La base de datos (Supabase) no está configurada." };
}

// Limitador simple de intentos por IP (en memoria; en despliegues con varias instancias es orientativo).
const intentos = new Map<string, { n: number; hasta: number }>();
export function limitarIntentos(clave: string, max = 5, ventanaMs = 10 * 60_000): boolean {
  const ahora = Date.now();
  const e = intentos.get(clave);
  if (!e || e.hasta < ahora) {
    intentos.set(clave, { n: 1, hasta: ahora + ventanaMs });
    return true;
  }
  e.n++;
  return e.n <= max;
}

const iguales = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

export async function iniciarSesion(correo: string, clave: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const estado = estadoAuth();
  if (!estado.disponible) return { ok: false, error: estado.motivo };
  let sub: string;
  let nombre: string;

  if (estado.metodo === "demo") {
    if (!iguales(correo.toLowerCase(), process.env.ADMIN_DEMO_EMAIL!.toLowerCase()) || !iguales(clave, process.env.ADMIN_DEMO_PASSWORD!))
      return { ok: false, error: "Correo o contraseña incorrectos." };
    sub = "demo-admin";
    nombre = "Administrador (demo)";
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const { data, error } = await anon.auth.signInWithPassword({ email: correo, password: clave });
    if (error || !data.user) return { ok: false, error: "Correo o contraseña incorrectos." };
    const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    const { data: fila } = await admin.from("admin_usuarios").select("nombre").eq("user_id", data.user.id).maybeSingle();
    if (!fila) return { ok: false, error: "Esta cuenta no tiene permisos de administración." };
    sub = data.user.id;
    nombre = (fila.nombre as string) || data.user.email || "Administrador";
  }

  const token = await firmarSesion(sub, nombre, secretoSesion()!);
  (await cookies()).set(COOKIE_ADMIN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_S,
  });
  return { ok: true };
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_ADMIN);
}

/** Obtiene la sesión actual o redirige al login. Úsela en TODAS las páginas y acciones del panel. */
export async function requerirAdmin() {
  const token = (await cookies()).get(COOKIE_ADMIN)?.value;
  const sesion = await verificarSesion(token, secretoSesion());
  if (!sesion) redirect("/admin/login");
  return sesion;
}
