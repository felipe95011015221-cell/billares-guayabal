import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generarCodigo, slugify } from "../format";
import type { Ajustes, Reserva } from "../types";
import { ajustesPorDefecto, galeriaInicial } from "./defaults";
import { ErrorNegocio, type Repositorio } from "./repository";

/**
 * Implementación de producción sobre Supabase/PostgreSQL.
 * Usa la clave service_role SOLO en el servidor. Las tablas tienen RLS sin políticas públicas.
 */
let cliente: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cliente;
}

// ---- conversión snake_case <-> camelCase ----
const aCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
const aSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function camel<T>(fila: any): T {
  return Object.fromEntries(Object.entries(fila).map(([k, v]) => [aCamel(k), v])) as T;
}
function snake(obj: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined).map(([k, v]) => [aSnake(k), v]));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ok<T>(r: { data: any; error: any }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}
const lista = <T>(r: { data: unknown; error: unknown }) => (ok<unknown[]>(r as never) ?? []).map((x) => camel<T>(x));

function traducirError(mensaje: string): never {
  if (mensaje.includes("MESA_NO_DISPONIBLE") || mensaje.includes("reservas_sin_solapamiento"))
    throw new ErrorNegocio("Otra persona acaba de tomar esta mesa en ese horario. Elige otra mesa u hora.", "conflicto");
  if (mensaje.includes("SIN_CUPOS")) throw new ErrorNegocio("No quedan cupos disponibles.", "sin_cupos");
  if (mensaje.includes("DUPLICADO")) throw new ErrorNegocio("Este celular ya tiene una inscripción registrada.", "conflicto");
  if (mensaje.includes("CERRADO")) throw new ErrorNegocio("Las inscripciones no están abiertas.");
  if (mensaje.includes("SESION_PASADA")) throw new ErrorNegocio("Este horario ya pasó.");
  if (mensaje.includes("NO_ENCONTRADO") || mensaje.includes("MESA_NO_ENCONTRADA")) throw new ErrorNegocio("Registro no encontrado.", "no_encontrado");
  throw new Error(mensaje);
}

async function upsertTabla<T>(tabla: string, item: Record<string, unknown>): Promise<T> {
  const fila = snake(item);
  const r = await db().from(tabla).upsert(fila).select().single();
  return camel<T>(ok(r));
}

export const supabaseStore: Repositorio = {
  async obtenerAjustes() {
    const r = await db().from("ajustes").select("datos").eq("id", 1).maybeSingle();
    return { ...ajustesPorDefecto, ...((ok<{ datos: Partial<Ajustes> } | null>(r))?.datos ?? {}) };
  },
  async guardarAjustes(a) {
    const actual = await this.obtenerAjustes();
    const datos = { ...actual, ...a };
    ok(await db().from("ajustes").upsert({ id: 1, datos, actualizado_en: new Date().toISOString() }));
    return datos;
  },

  async listarMesas() { return lista(await db().from("mesas").select("*").order("orden")); },
  guardarMesa: (m) => upsertTabla("mesas", m as never),

  async listarBloqueos(desde, hasta) { return lista(await db().from("bloqueos").select("*").lt("inicio", hasta).gt("fin", desde)); },
  crearBloqueo: (b) => upsertTabla("bloqueos", b as never),
  async eliminarBloqueo(id) { ok(await db().from("bloqueos").delete().eq("id", id)); },

  async listarReservas(desde, hasta) {
    return lista(await db().from("reservas").select("*").lt("inicio", hasta).gt("fin", desde).order("inicio"));
  },
  async listarReservasRecientes(limite) { return lista(await db().from("reservas").select("*").order("creada_en", { ascending: false }).limit(limite)); },
  async crearReserva(r) {
    const historial = [{ fecha: new Date().toISOString(), accion: r.estado === "confirmada" ? "confirmada automáticamente" : "solicitud recibida" }];
    const res = await db().rpc("crear_reserva", {
      p_codigo: generarCodigo("BG"), p_mesa_id: r.mesaId, p_modalidad: r.modalidad, p_inicio: r.inicio, p_fin: r.fin,
      p_nombre: r.nombre, p_celular: r.celular, p_correo: r.correo, p_estado: r.estado, p_valor: r.valorEstimado, p_historial: historial,
    });
    if (res.error) traducirError(res.error.message);
    return camel<Reserva>(res.data);
  },
  async obtenerReservaPorCodigo(codigo) {
    const r = ok<unknown>(await db().from("reservas").select("*").eq("codigo", codigo).maybeSingle());
    return r ? camel<Reserva>(r) : null;
  },
  async actualizarReserva(id, cambios, accion) {
    const actual = camel<Reserva>(ok(await db().from("reservas").select("*").eq("id", id).single()));
    const historial = [...(actual.historial ?? []), { fecha: new Date().toISOString(), accion, detalle: cambios.observaciones }];
    const r = await db().from("reservas").update({ ...snake(cambios), historial }).eq("id", id).select().single();
    if (r.error) traducirError(r.error.message);
    return camel<Reserva>(r.data);
  },

  async listarInstructores() { return lista(await db().from("instructores").select("*").order("nombre")); },
  guardarInstructor: (i) => upsertTabla("instructores", i as never),
  async listarClases() { return lista(await db().from("clases").select("*").order("titulo")); },
  guardarClase: (c) => upsertTabla("clases", { ...c, slug: c.slug || slugify(c.titulo) } as never),
  async listarSesiones(claseId) {
    let q = db().from("sesiones_clase").select("*").order("inicio");
    if (claseId) q = q.eq("clase_id", claseId);
    return lista(await q);
  },
  guardarSesion: (s) => upsertTabla("sesiones_clase", s as never),
  async eliminarSesion(id) { ok(await db().from("sesiones_clase").delete().eq("id", id)); },
  async listarInscripcionesClase() { return lista(await db().from("inscripciones_clase").select("*").order("creada_en", { ascending: false })); },
  async inscribirClase(i) {
    const r = await db().rpc("inscribir_clase", {
      p_codigo: generarCodigo("CL"), p_sesion_id: i.sesionId, p_nombre: i.nombre, p_celular: i.celular, p_correo: i.correo, p_nivel: i.nivelDeclarado ?? null,
    });
    if (r.error) traducirError(r.error.message);
    return camel(r.data);
  },
  async actualizarInscripcionClase(id, estado) { ok(await db().from("inscripciones_clase").update({ estado }).eq("id", id)); },

  async listarTorneos() { return lista(await db().from("torneos").select("*").order("fecha")); },
  guardarTorneo: (t) => upsertTabla("torneos", { ...t, esDemo: undefined, slug: t.slug || slugify(t.nombre) } as never),
  async listarInscripcionesTorneo(torneoId) {
    let q = db().from("inscripciones_torneo").select("*").order("creada_en");
    if (torneoId) q = q.eq("torneo_id", torneoId);
    return lista(await q);
  },
  async inscribirTorneo(i) {
    const r = await db().rpc("inscribir_torneo", {
      p_codigo: generarCodigo("TG"), p_torneo_id: i.torneoId, p_nombre: i.nombre, p_celular: i.celular, p_correo: i.correo, p_documento: i.documento ?? null,
    });
    if (r.error) traducirError(r.error.message);
    return camel(r.data);
  },
  async actualizarInscripcionTorneo(id, estado) { ok(await db().from("inscripciones_torneo").update({ estado }).eq("id", id)); },
  async listarPartidos(torneoId) { return lista(await db().from("partidos").select("*").eq("torneo_id", torneoId).order("ronda").order("orden")); },
  async guardarPartidos(torneoId, partidos) {
    ok(await db().from("partidos").delete().eq("torneo_id", torneoId));
    if (!partidos.length) return [];
    return lista(await db().from("partidos").insert(partidos.map((p) => snake({ ...p, torneoId }))).select());
  },

  async crearSolicitudEvento(s) {
    return camel(ok(await db().from("solicitudes_evento").insert(snake({ ...s, codigo: generarCodigo("EV") })).select().single()));
  },
  async listarSolicitudesEvento() { return lista(await db().from("solicitudes_evento").select("*").order("creada_en", { ascending: false })); },
  async actualizarSolicitudEvento(id, cambios) { ok(await db().from("solicitudes_evento").update(snake(cambios)).eq("id", id)); },
  async crearMensaje(m) { ok(await db().from("mensajes_contacto").insert(snake(m))); },
  async listarMensajes() { return lista(await db().from("mensajes_contacto").select("*").order("creado_en", { ascending: false })); },
  async marcarMensajeLeido(id) { ok(await db().from("mensajes_contacto").update({ leido: true }).eq("id", id)); },

  async listarGaleria() {
    const fotos = lista<import("../types").FotoGaleria>(await db().from("galeria").select("*").order("orden"));
    if (fotos.length) return fotos;
    // Primera carga: inserta las fotos de referencia.
    return lista(await db().from("galeria").insert(galeriaInicial.map((g) => snake(g as never))).select());
  },
  guardarFoto: (f) => upsertTabla("galeria", f as never),
  async eliminarFoto(id) { ok(await db().from("galeria").delete().eq("id", id)); },
  async subirArchivo(nombre, datos, tipo) {
    const ruta = `${Date.now()}-${nombre.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    ok(await db().storage.from("galeria").upload(ruta, datos, { contentType: tipo, upsert: false }));
    return db().storage.from("galeria").getPublicUrl(ruta).data.publicUrl;
  },
};
