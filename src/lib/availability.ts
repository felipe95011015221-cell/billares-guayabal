/**
 * Motor de disponibilidad (funciones puras, sin acceso a datos).
 * Se usa tanto para mostrar la disponibilidad como para RE-VERIFICAR al confirmar.
 * En producción, PostgreSQL añade una restricción de exclusión que impide solapamientos
 * incluso ante solicitudes simultáneas (ver supabase/migrations).
 */
import type { Ajustes, Bloqueo, EstadoMesa, Mesa, Modalidad, Reserva } from "./types";
import { ESTADOS_RESERVA_ACTIVOS } from "./types";
import { instanteBogota } from "./time";

export interface Rango {
  inicio: number; // epoch ms
  fin: number;
}

export const seSolapan = (a: Rango, b: Rango) => a.inicio < b.fin && b.inicio < a.fin;

const rangoDe = (x: { inicio: string; fin: string }): Rango => ({
  inicio: new Date(x.inicio).getTime(),
  fin: new Date(x.fin).getTime(),
});

/** Estado de una mesa en un rango. Prioridad: bloqueada > ocupada > reservada > pendiente > disponible. */
export function estadoMesa(mesa: Mesa, rango: Rango, reservas: Reserva[], bloqueos: Bloqueo[]): EstadoMesa {
  if (!mesa.activa || mesa.mantenimiento) return "bloqueada";
  const bloq = bloqueos.filter((b) => b.mesaId === mesa.id && seSolapan(rango, rangoDe(b)));
  if (bloq.some((b) => b.tipo !== "ocupada")) return "bloqueada";
  if (bloq.length) return "ocupada";
  const res = reservas.filter(
    (r) => r.mesaId === mesa.id && ESTADOS_RESERVA_ACTIVOS.includes(r.estado) && seSolapan(rango, rangoDe(r)),
  );
  if (res.some((r) => r.estado === "en_curso")) return "ocupada";
  if (res.some((r) => r.estado === "confirmada")) return "reservada";
  if (res.some((r) => r.estado === "pendiente")) return "pendiente";
  return "disponible";
}

export interface ResultadoValidacionHorario {
  ok: boolean;
  error?: string;
}

/** Valida que un horario solicitado esté dentro de las reglas del club. */
export function validarHorario(
  fecha: string,
  inicioMin: number,
  duracionMin: number,
  ajustes: Ajustes,
  ahora = new Date(),
): ResultadoValidacionHorario {
  if (!ajustes.duracionesMin.includes(duracionMin)) return { ok: false, error: "Duración no permitida." };
  if (inicioMin % ajustes.intervaloMin !== 0) return { ok: false, error: "Hora de inicio no válida." };
  if (inicioMin < ajustes.horaApertura || inicioMin + duracionMin > ajustes.horaCierre)
    return { ok: false, error: "El horario está fuera del horario de atención." };
  const inicio = instanteBogota(fecha, inicioMin).getTime();
  if (inicio < ahora.getTime() + ajustes.anticipacionMinimaMin * 60_000)
    return { ok: false, error: `Las reservas requieren al menos ${ajustes.anticipacionMinimaMin} minutos de anticipación.` };
  if (inicio > ahora.getTime() + ajustes.diasMaximosAnticipacion * 86_400_000)
    return { ok: false, error: `Solo se reciben reservas con hasta ${ajustes.diasMaximosAnticipacion} días de anticipación.` };
  return { ok: true };
}

/** Horas de inicio posibles para una fecha/duración, con cuántas mesas libres hay en cada una. */
export function franjasDisponibles(params: {
  fecha: string;
  duracionMin: number;
  modalidad: Modalidad;
  mesas: Mesa[];
  reservas: Reserva[];
  bloqueos: Bloqueo[];
  ajustes: Ajustes;
  ahora?: Date;
}) {
  const { fecha, duracionMin, modalidad, mesas, reservas, bloqueos, ajustes, ahora = new Date() } = params;
  const delTipo = mesas.filter((m) => m.modalidad === modalidad);
  const franjas: { inicioMin: number; libres: number; total: number }[] = [];
  for (let t = ajustes.horaApertura; t + duracionMin <= ajustes.horaCierre; t += ajustes.intervaloMin) {
    if (!validarHorario(fecha, t, duracionMin, ajustes, ahora).ok) continue;
    const rango = {
      inicio: instanteBogota(fecha, t).getTime(),
      fin: instanteBogota(fecha, t + duracionMin).getTime(),
    };
    const libres = delTipo.filter((m) => estadoMesa(m, rango, reservas, bloqueos) === "disponible").length;
    franjas.push({ inicioMin: t, libres, total: delTipo.length });
  }
  return franjas;
}

export function valorEstimado(mesa: Mesa, duracionMin: number): number | null {
  return mesa.tarifaHora == null ? null : Math.round((mesa.tarifaHora * duracionMin) / 60);
}
