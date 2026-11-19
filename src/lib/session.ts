/**
 * Token de sesión administrativa firmado con HMAC-SHA256 (Web Crypto: funciona en middleware y en Node).
 * Formato: base64url(payload).base64url(firma)
 */
export const COOKIE_ADMIN = "bg_admin";
export const DURACION_SESION_S = 8 * 60 * 60;

interface Payload {
  sub: string;
  nombre: string;
  exp: number;
}

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const desdeB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function clave(secreto: string) {
  return crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function firmarSesion(sub: string, nombre: string, secreto: string): Promise<string> {
  const payload: Payload = { sub, nombre, exp: Math.floor(Date.now() / 1000) + DURACION_SESION_S };
  const cuerpo = b64url(enc.encode(JSON.stringify(payload)));
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), enc.encode(cuerpo));
  return `${cuerpo}.${b64url(firma)}`;
}

export async function verificarSesion(token: string | undefined, secreto: string | null): Promise<Payload | null> {
  if (!token || !secreto) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;
  try {
    const valido = await crypto.subtle.verify("HMAC", await clave(secreto), desdeB64url(firma), enc.encode(cuerpo));
    if (!valido) return null;
    const p = JSON.parse(new TextDecoder().decode(desdeB64url(cuerpo))) as Payload;
    return p.exp > Date.now() / 1000 ? p : null;
  } catch {
    return null;
  }
}
