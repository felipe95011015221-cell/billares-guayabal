/**
 * Utilidades de fecha/hora para America/Bogota (UTC-5 todo el año, sin horario de verano).
 * Las reservas se guardan como instantes absolutos (ISO) y se presentan en hora de Bogotá.
 */
export const OFFSET_BOGOTA = "-05:00";
const OFFSET_MS = 5 * 60 * 60 * 1000;

/** Fecha local "YYYY-MM-DD" + minutos desde 00:00 local (puede ser > 1440) -> Date absoluto. */
export function instanteBogota(fecha: string, minutos: number): Date {
  const base = new Date(`${fecha}T00:00:00${OFFSET_BOGOTA}`);
  return new Date(base.getTime() + minutos * 60_000);
}

/** Fecha "YYYY-MM-DD" de hoy en Bogotá. */
export function hoyBogota(ahora = new Date()): string {
  return new Date(ahora.getTime() - OFFSET_MS).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}

export function etiquetaMinutos(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const sufijo = h24 < 12 ? "a. m." : "p. m.";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export function etiquetaDuracion(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} ${h === 1 ? "hora" : "horas"}`;
}

const fmtFecha = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtFechaCorta = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "short", day: "numeric", month: "short" });
const fmtHora = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit", hour12: true });

export const formatoFecha = (iso: string | Date) => fmtFecha.format(new Date(iso));
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const formatoFechaCorta = (iso: string | Date) => mayuscula(fmtFechaCorta.format(new Date(iso)));
export const formatoHora = (iso: string | Date) => fmtHora.format(new Date(iso));
export const formatoFechaLocal = (fecha: string) => fmtFecha.format(new Date(`${fecha}T12:00:00${OFFSET_BOGOTA}`));

/** Minutos desde 00:00 de `fecha` (Bogotá) para un instante dado. */
export function minutosDesdeFecha(fecha: string, iso: string): number {
  return Math.round((new Date(iso).getTime() - instanteBogota(fecha, 0).getTime()) / 60_000);
}
