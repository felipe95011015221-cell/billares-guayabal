import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { estadoMesa } from "../availability";
import { generarCodigo, slugify } from "../format";
import { hoyBogota, instanteBogota, sumarDias } from "../time";
import type {
  Ajustes, Bloqueo, Clase, FotoGaleria, InscripcionClase, InscripcionTorneo, Instructor, MensajeContacto, Mesa,
  Partido, Reserva, SesionClase, SolicitudEvento, Torneo,
} from "../types";
import { ajustesPorDefecto, clasesPropuestas, galeriaInicial, mesasEjemplo } from "./defaults";
import { ErrorNegocio, type NuevaReserva, type Repositorio } from "./repository";

/**
 * MODO DEMOSTRACIÓN — solo para desarrollo local.
 * Persiste en .data/demo-db.json. Contiene datos FICTICIOS para probar los flujos.
 * Una cola de escritura serializa las operaciones para evitar condiciones de carrera
 * dentro del proceso (en producción, PostgreSQL garantiza la atomicidad).
 */
interface DB {
  ajustes: Ajustes;
  mesas: Mesa[];
  bloqueos: Bloqueo[];
  reservas: Reserva[];
  instructores: Instructor[];
  clases: Clase[];
  sesiones: SesionClase[];
  inscripcionesClase: InscripcionClase[];
  torneos: Torneo[];
  inscripcionesTorneo: InscripcionTorneo[];
  partidos: Partido[];
  solicitudesEvento: SolicitudEvento[];
  mensajes: MensajeContacto[];
  galeria: FotoGaleria[];
}

const ARCHIVO = path.join(process.cwd(), ".data", "demo-db.json");
const id = () => randomUUID();
const ahoraISO = () => new Date().toISOString();

function semilla(): DB {
  const hoy = hoyBogota();
  const mesas = mesasEjemplo.map((m) => ({ ...m, id: id() }));
  const clases = clasesPropuestas.map((c) => ({ ...c, id: id() }));
  const sesiones: SesionClase[] = [];
  clases.forEach((c, i) => {
    for (let d = 0; d < 3; d++) {
      const fecha = sumarDias(hoy, 2 + i + d * 7);
      sesiones.push({ id: id(), claseId: c.id, inicio: instanteBogota(fecha, (i % 2 ? 18 : 10) * 60).toISOString(), cupos: c.slug === "clases-particulares" ? 1 : 6 });
    }
  });
  const res = (mesa: Mesa, dias: number, hIni: number, dur: number, estado: Reserva["estado"], nombre: string): Reserva => {
    const fecha = sumarDias(hoy, dias);
    return {
      id: id(), codigo: generarCodigo("BG"), mesaId: mesa.id, modalidad: mesa.modalidad,
      inicio: instanteBogota(fecha, hIni * 60).toISOString(), fin: instanteBogota(fecha, hIni * 60 + dur).toISOString(),
      nombre, celular: "3000000000", correo: "demo@example.com", estado, valorEstimado: null,
      observaciones: "Reserva ficticia del modo demostración.",
      historial: [{ fecha: ahoraISO(), accion: "creada", detalle: "Semilla de demostración" }], creadaEn: ahoraISO(),
    };
  };
  const torneoId = id();
  const jugadores = ["Jugador A", "Jugador B", "Jugador C", "Jugador D", "Jugador E", "Jugador F", "Jugador G", "Jugador H"];
  return {
    ajustes: ajustesPorDefecto,
    mesas,
    bloqueos: [{ id: id(), mesaId: mesas[3].id, inicio: instanteBogota(sumarDias(hoy, 1), 9 * 60).toISOString(), fin: instanteBogota(sumarDias(hoy, 1), 14 * 60).toISOString(), tipo: "mantenimiento", motivo: "Cambio de paño (demo)" }],
    reservas: [
      res(mesas[0], 1, 19, 120, "confirmada", "Cliente Demo 1"),
      res(mesas[1], 1, 20, 90, "pendiente", "Cliente Demo 2"),
      res(mesas[4], 1, 21, 60, "confirmada", "Cliente Demo 3"),
      res(mesas[5], 2, 18, 120, "pendiente", "Cliente Demo 4"),
    ],
    instructores: [],
    clases,
    sesiones,
    inscripcionesClase: [],
    torneos: [
      {
        id: torneoId, slug: "torneo-demostracion-tres-bandas", nombre: "Torneo de demostración · Tres bandas",
        modalidad: "carambola", fecha: instanteBogota(sumarDias(hoy, 21), 14 * 60).toISOString(),
        formato: "Eliminación directa a 20 carambolas", requisitos: "Mayor de edad. Llegar 30 minutos antes.",
        valorInscripcion: null, cupos: 16, estado: "inscripciones_abiertas", publicado: true, esDemo: true,
        descripcion: "Torneo ficticio para probar inscripciones y el cuadro de eliminación. No es un evento real.",
      },
    ],
    inscripcionesTorneo: jugadores.map((n) => ({ id: id(), codigo: generarCodigo("TG"), torneoId, nombre: n, celular: "3000000000", correo: "demo@example.com", estado: "confirmada", creadaEn: ahoraISO() })),
    partidos: [
      ...[0, 1, 2, 3].map((k) => ({ id: id(), torneoId, ronda: 1, orden: k, jugadorA: jugadores[k * 2], jugadorB: jugadores[k * 2 + 1], marcadorA: k < 2 ? 20 : null, marcadorB: k < 2 ? 14 + k : null, ganador: k < 2 ? ("A" as const) : null })),
      { id: id(), torneoId, ronda: 2, orden: 0, jugadorA: jugadores[0], jugadorB: jugadores[2], marcadorA: null, marcadorB: null, ganador: null },
      { id: id(), torneoId, ronda: 2, orden: 1, jugadorA: null, jugadorB: null, marcadorA: null, marcadorB: null, ganador: null },
      { id: id(), torneoId, ronda: 3, orden: 0, jugadorA: null, jugadorB: null, marcadorA: null, marcadorB: null, ganador: null },
    ],
    solicitudesEvento: [],
    mensajes: [],
    galeria: galeriaInicial.map((g) => ({ ...g, id: id() })),
  };
}

let cola: Promise<unknown> = Promise.resolve();
let cache: DB | null = null;

async function leer(): Promise<DB> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(ARCHIVO, "utf8")) as DB;
  } catch {
    cache = semilla();
    await escribir(cache);
  }
  return cache;
}

async function escribir(db: DB) {
  await fs.mkdir(path.dirname(ARCHIVO), { recursive: true });
  const tmp = `${ARCHIVO}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, ARCHIVO);
}

/** Ejecuta una mutación en exclusión mutua y persiste el resultado. */
function mutar<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const siguiente = cola.then(async () => {
    const db = await leer();
    const r = await fn(db);
    await escribir(db);
    return r;
  });
  cola = siguiente.catch(() => undefined);
  return siguiente;
}

const solapa = (x: { inicio: string; fin: string }, desde: string, hasta: string) => x.inicio < hasta && desde < x.fin;
const upsert = <T extends { id: string }>(lista: T[], item: Omit<T, "id"> & { id?: string }): T => {
  const completo = { ...item, id: item.id ?? id() } as T;
  const i = lista.findIndex((x) => x.id === completo.id);
  if (i >= 0) lista[i] = completo;
  else lista.push(completo);
  return completo;
};

export const demoStore: Repositorio = {
  async obtenerAjustes() { return { ...ajustesPorDefecto, ...(await leer()).ajustes }; },
  guardarAjustes: (a) => mutar((db) => (db.ajustes = { ...db.ajustes, ...a })),

  async listarMesas() { return [...(await leer()).mesas].sort((a, b) => a.orden - b.orden); },
  guardarMesa: (m) => mutar((db) => upsert(db.mesas, m)),

  async listarBloqueos(desde, hasta) { return (await leer()).bloqueos.filter((b) => solapa(b, desde, hasta)); },
  crearBloqueo: (b) => mutar((db) => upsert(db.bloqueos, b)),
  eliminarBloqueo: (bid) => mutar((db) => void (db.bloqueos = db.bloqueos.filter((b) => b.id !== bid))),

  async listarReservas(desde, hasta) {
    return (await leer()).reservas.filter((r) => solapa(r, desde, hasta)).sort((a, b) => a.inicio.localeCompare(b.inicio));
  },
  async listarReservasRecientes(limite) {
    return [...(await leer()).reservas].sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)).slice(0, limite);
  },
  crearReserva: (r: NuevaReserva) =>
    mutar((db) => {
      const mesa = db.mesas.find((m) => m.id === r.mesaId && m.modalidad === r.modalidad);
      if (!mesa) throw new ErrorNegocio("La mesa seleccionada no existe.", "no_encontrado");
      const rango = { inicio: new Date(r.inicio).getTime(), fin: new Date(r.fin).getTime() };
      // Re-verificación dentro de la sección crítica: nadie más puede escribir entre esta lectura y la inserción.
      if (estadoMesa(mesa, rango, db.reservas, db.bloqueos) !== "disponible")
        throw new ErrorNegocio("Otra persona acaba de tomar esta mesa en ese horario. Elige otra mesa u hora.", "conflicto");
      const nueva: Reserva = {
        ...r, id: id(), codigo: generarCodigo("BG"), creadaEn: ahoraISO(),
        historial: [{ fecha: ahoraISO(), accion: r.estado === "confirmada" ? "confirmada automáticamente" : "solicitud recibida" }],
      };
      db.reservas.push(nueva);
      return nueva;
    }),
  async obtenerReservaPorCodigo(codigo) { return (await leer()).reservas.find((r) => r.codigo === codigo) ?? null; },
  actualizarReserva: (rid, cambios, accion) =>
    mutar((db) => {
      const r = db.reservas.find((x) => x.id === rid);
      if (!r) throw new ErrorNegocio("Reserva no encontrada.", "no_encontrado");
      const mueveHorario = cambios.inicio || cambios.fin || cambios.mesaId;
      const reactiva = cambios.estado && ["pendiente", "confirmada", "en_curso"].includes(cambios.estado);
      if (mueveHorario || reactiva) {
        const prop = { ...r, ...cambios };
        const mesa = db.mesas.find((m) => m.id === prop.mesaId);
        if (!mesa) throw new ErrorNegocio("Mesa no encontrada.", "no_encontrado");
        const otras = db.reservas.filter((x) => x.id !== rid);
        const rango = { inicio: new Date(prop.inicio).getTime(), fin: new Date(prop.fin).getTime() };
        const est = estadoMesa({ ...mesa, mantenimiento: false, activa: true }, rango, otras, db.bloqueos);
        if (est !== "disponible") throw new ErrorNegocio("El nuevo horario se cruza con otra reserva o bloqueo.", "conflicto");
      }
      Object.assign(r, cambios);
      r.historial.push({ fecha: ahoraISO(), accion, detalle: cambios.observaciones });
      return r;
    }),

  async listarInstructores() { return (await leer()).instructores; },
  guardarInstructor: (i) => mutar((db) => upsert(db.instructores, i)),
  async listarClases() { return (await leer()).clases; },
  guardarClase: (c) => mutar((db) => upsert(db.clases, { ...c, slug: c.slug || slugify(c.titulo) })),
  async listarSesiones(claseId) {
    return (await leer()).sesiones.filter((s) => !claseId || s.claseId === claseId).sort((a, b) => a.inicio.localeCompare(b.inicio));
  },
  guardarSesion: (s) => mutar((db) => upsert(db.sesiones, s)),
  eliminarSesion: (sid) =>
    mutar((db) => {
      db.sesiones = db.sesiones.filter((s) => s.id !== sid);
      db.inscripcionesClase = db.inscripcionesClase.filter((i) => i.sesionId !== sid); // igual que ON DELETE CASCADE
    }),
  async listarInscripcionesClase() { return [...(await leer()).inscripcionesClase].sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)); },
  inscribirClase: (i) =>
    mutar((db) => {
      const sesion = db.sesiones.find((s) => s.id === i.sesionId);
      if (!sesion) throw new ErrorNegocio("El horario seleccionado no existe.", "no_encontrado");
      const clase = db.clases.find((c) => c.id === sesion.claseId);
      if (!clase?.activa) throw new ErrorNegocio("Esta clase no está disponible.", "no_encontrado");
      if (new Date(sesion.inicio).getTime() < Date.now()) throw new ErrorNegocio("Este horario ya pasó.");
      const ocupados = db.inscripcionesClase.filter((x) => x.sesionId === sesion.id && x.estado !== "cancelada");
      if (ocupados.length >= sesion.cupos) throw new ErrorNegocio("No quedan cupos en este horario.", "sin_cupos");
      if (ocupados.some((x) => x.celular === i.celular)) throw new ErrorNegocio("Ya tienes una inscripción en este horario.", "conflicto");
      const nueva: InscripcionClase = { ...i, id: id(), claseId: clase.id, codigo: generarCodigo("CL"), estado: "pendiente", creadaEn: ahoraISO() };
      db.inscripcionesClase.push(nueva);
      return nueva;
    }),
  actualizarInscripcionClase: (iid, estado) =>
    mutar((db) => { const x = db.inscripcionesClase.find((y) => y.id === iid); if (x) x.estado = estado; }),

  async listarTorneos() { return [...(await leer()).torneos].sort((a, b) => a.fecha.localeCompare(b.fecha)); },
  guardarTorneo: (t) => mutar((db) => upsert(db.torneos, { ...t, slug: t.slug || slugify(t.nombre) })),
  async listarInscripcionesTorneo(torneoId) {
    return (await leer()).inscripcionesTorneo.filter((x) => !torneoId || x.torneoId === torneoId);
  },
  inscribirTorneo: (i) =>
    mutar((db) => {
      const t = db.torneos.find((x) => x.id === i.torneoId);
      if (!t || !t.publicado) throw new ErrorNegocio("Torneo no encontrado.", "no_encontrado");
      if (t.estado !== "inscripciones_abiertas") throw new ErrorNegocio("Las inscripciones de este torneo no están abiertas.");
      const actuales = db.inscripcionesTorneo.filter((x) => x.torneoId === t.id && x.estado !== "cancelada");
      if (actuales.length >= t.cupos) throw new ErrorNegocio("El torneo no tiene cupos disponibles.", "sin_cupos");
      if (actuales.some((x) => x.celular === i.celular)) throw new ErrorNegocio("Este celular ya está inscrito en el torneo.", "conflicto");
      const nueva: InscripcionTorneo = { ...i, id: id(), codigo: generarCodigo("TG"), estado: "pendiente", creadaEn: ahoraISO() };
      db.inscripcionesTorneo.push(nueva);
      return nueva;
    }),
  actualizarInscripcionTorneo: (iid, estado) =>
    mutar((db) => { const x = db.inscripcionesTorneo.find((y) => y.id === iid); if (x) x.estado = estado; }),
  async listarPartidos(torneoId) {
    return (await leer()).partidos.filter((p) => p.torneoId === torneoId).sort((a, b) => a.ronda - b.ronda || a.orden - b.orden);
  },
  guardarPartidos: (torneoId, partidos) =>
    mutar((db) => {
      db.partidos = db.partidos.filter((p) => p.torneoId !== torneoId);
      const nuevos = partidos.map((p) => ({ ...p, id: id(), torneoId }));
      db.partidos.push(...nuevos);
      return nuevos;
    }),

  crearSolicitudEvento: (s) =>
    mutar((db) => {
      const nueva: SolicitudEvento = { ...s, id: id(), codigo: generarCodigo("EV"), estado: "nueva", creadaEn: ahoraISO() };
      db.solicitudesEvento.push(nueva);
      return nueva;
    }),
  async listarSolicitudesEvento() { return [...(await leer()).solicitudesEvento].sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)); },
  actualizarSolicitudEvento: (sid, cambios) =>
    mutar((db) => { const s = db.solicitudesEvento.find((x) => x.id === sid); if (s) Object.assign(s, cambios); }),
  crearMensaje: (m) => mutar((db) => void db.mensajes.push({ ...m, id: id(), leido: false, creadoEn: ahoraISO() })),
  async listarMensajes() { return [...(await leer()).mensajes].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)); },
  marcarMensajeLeido: (mid) => mutar((db) => { const m = db.mensajes.find((x) => x.id === mid); if (m) m.leido = true; }),

  async listarGaleria() { return [...(await leer()).galeria].sort((a, b) => a.orden - b.orden); },
  guardarFoto: (f) => mutar((db) => upsert(db.galeria, f)),
  eliminarFoto: (fid) => mutar((db) => void (db.galeria = db.galeria.filter((f) => f.id !== fid))),
  async subirArchivo(nombre, datos) {
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const archivo = `${Date.now()}-${nombre.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    await fs.writeFile(path.join(dir, archivo), Buffer.from(datos));
    return `/uploads/${archivo}`;
  },
};
