import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cop =new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export function formatoCOP(valor: number | null | undefined, vacio = "Por confirmar"): string {
  return valor == null ? vacio : cop.format(valor);
}

/** Une clases resolviendo conflictos de Tailwind (p. ej. "relative" vs "absolute"). */
export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}

/** Código legible sin caracteres ambiguos (sin 0/O, 1/I/L). */
export function generarCodigo(prefijo: string, largo = 6): string {
  const alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(largo);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += alfabeto[b % alfabeto.length];
  return `${prefijo}-${s}`;
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Celular colombiano: deja solo dígitos y quita el 57 inicial. */
export function normalizarCelular(c: string): string {
  const d = c.replace(/\D/g, "");
  return d.length === 12 && d.startsWith("57") ? d.slice(2) : d;
}

export function ocultarCelular(c: string): string {
  const d = normalizarCelular(c);
  return d.length >= 4 ? `••• ••• ${d.slice(-4)}` : "•••";
}
