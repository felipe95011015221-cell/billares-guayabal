import "server-only";
import { repo } from "./data";
import { ajustesPorDefecto, clasesPropuestas, galeriaInicial } from "./data/defaults";
import type { Clase, FotoGaleria, Instructor, SesionClase, Torneo } from "./types";

export interface SesionPublica extends SesionClase {
  disponibles: number;
}
export interface ClasePublica extends Clase {
  instructor: Instructor | null;
  sesiones: SesionPublica[];
}

/** Lecturas para las páginas públicas. Si no hay base de datos, usa los valores por defecto (sin horarios). */
export async function clasesPublicas(): Promise<ClasePublica[]> {
  const r = repo();
  if (!r) return clasesPropuestas.map((c, i) => ({ ...c, id: `p${i}`, instructor: null, sesiones: [] }));
  const [clases, sesiones, inscripciones, instructores] = await Promise.all([
    r.listarClases(), r.listarSesiones(), r.listarInscripcionesClase(), r.listarInstructores(),
  ]);
  const ahora = Date.now();
  return clases
    .filter((c) => c.activa)
    .map((c) => ({
      ...c,
      instructor: instructores.find((i) => i.id === c.instructorId && i.activo) ?? null,
      sesiones: sesiones
        .filter((s) => s.claseId === c.id && new Date(s.inicio).getTime() > ahora)
        .slice(0, 6)
        .map((s) => ({ ...s, disponibles: s.cupos - inscripciones.filter((i) => i.sesionId === s.id && i.estado !== "cancelada").length })),
    }));
}

export interface TorneoPublico extends Torneo {
  inscritos: number;
}

/** Solo torneos publicados por el club. En producción nunca hay torneos de demostración. */
export async function torneosPublicos(): Promise<TorneoPublico[]> {
  const r = repo();
  if (!r) return [];
  const [torneos, ins] = await Promise.all([r.listarTorneos(), r.listarInscripcionesTorneo()]);
  return torneos
    .filter((t) => t.publicado && t.estado !== "borrador")
    .map((t) => ({ ...t, inscritos: ins.filter((i) => i.torneoId === t.id && i.estado !== "cancelada").length }));
}

export async function galeriaPublica(): Promise<FotoGaleria[]> {
  const r = repo();
  if (!r) return galeriaInicial.map((g, i) => ({ ...g, id: `g${i}` }));
  return (await r.listarGaleria()).filter((f) => f.visible);
}

export async function ajustesPublicos() {
  const r = repo();
  return r ? r.obtenerAjustes() : ajustesPorDefecto;
}
