"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import sharp from "sharp";
import { z } from "zod";
import { cerrarSesion, iniciarSesion, limitarIntentos, requerirAdmin } from "@/lib/auth";
import { ErrorNegocio, repoOError } from "@/lib/data";
import { slugify } from "@/lib/format";
import { esFechaValida, instanteBogota } from "@/lib/time";
import type { EstadoReserva, EstadoTorneo, Partido } from "@/lib/types";

export type EstadoAccion = { ok: boolean; mensaje: string } | null;

const ok = (mensaje: string): EstadoAccion => ({ ok: true, mensaje });
const fallo = (mensaje: string): EstadoAccion => ({ ok: false, mensaje });

/** Ejecuta una acción administrativa: exige sesión, captura errores y revalida rutas. */
async function protegida(rutas: string[], fn: () => Promise<string>): Promise<EstadoAccion> {
  await requerirAdmin();
  try {
    const m = await fn();
    for (const r of rutas) revalidatePath(r, "layout");
    return ok(m);
  } catch (e) {
    if (e instanceof ErrorNegocio || e instanceof z.ZodError) return fallo(e instanceof z.ZodError ? e.issues[0]?.message ?? "Datos inválidos." : e.message);
    console.error(e);
    return fallo("No se pudo completar la operación.");
  }
}

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => (txt(f, k) === "" ? null : Number(txt(f, k)));
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

// ---------------- Sesión ----------------
export async function accionLogin(_: EstadoAccion, f: FormData): Promise<EstadoAccion> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!limitarIntentos(`login:${ip}`, 5, 15 * 60_000)) return fallo("Demasiados intentos. Espera 15 minutos.");
  const r = await iniciarSesion(txt(f, "correo"), String(f.get("clave") ?? ""));
  if (!r.ok) return fallo(r.error);
  redirect("/admin");
}

export async function accionLogout() {
  await cerrarSesion();
  redirect("/admin/login");
}

// ---------------- Reservas ----------------
const estadosReserva: EstadoReserva[] = ["pendiente", "confirmada", "en_curso", "finalizada", "cancelada", "rechazada"];
const accionesTexto: Record<EstadoReserva, string> = {
  pendiente: "marcada como pendiente", confirmada: "confirmada", en_curso: "cliente en mesa", finalizada: "finalizada", cancelada: "cancelada", rechazada: "rechazada",
};

export async function cambiarEstadoReserva(_: EstadoAccion, f: FormData) {
  return protegida(["/admin", "/reservas"], async () => {
    const estado = z.enum(estadosReserva as [EstadoReserva, ...EstadoReserva[]]).parse(txt(f, "estado"));
    await repoOError().actualizarReserva(txt(f, "id"), { estado }, accionesTexto[estado]);
    return `Reserva ${accionesTexto[estado]}.`;
  });
}

export async function guardarObservacion(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/reservas"], async () => {
    const obs = z.string().max(500).parse(txt(f, "observaciones"));
    await repoOError().actualizarReserva(txt(f, "id"), { observaciones: obs }, "observación registrada");
    return "Observación guardada.";
  });
}

export async function reprogramarReserva(_: EstadoAccion, f: FormData) {
  return protegida(["/admin", "/reservas"], async () => {
    const fecha = txt(f, "fecha");
    if (!esFechaValida(fecha)) throw new ErrorNegocio("Fecha inválida.");
    const [h, m] = txt(f, "hora").split(":").map(Number);
    const inicioMin = h * 60 + m; // fecha y hora de calendario reales (la madrugada se ingresa con la fecha del día siguiente)
    const dur = z.coerce.number().int().min(30).max(600).parse(txt(f, "duracion"));
    const r = repoOError();
    const inicio = instanteBogota(fecha, inicioMin).toISOString();
    const fin = instanteBogota(fecha, inicioMin + dur).toISOString();
    const mesaId = z.string().min(1, "Selecciona la mesa.").parse(txt(f, "mesaId"));
    // Los bloqueos se verifican aquí; los cruces con otras reservas los impide el repositorio (y la BD).
    if ((await r.listarBloqueos(inicio, fin)).some((b) => b.mesaId === mesaId))
      throw new ErrorNegocio("El nuevo horario se cruza con un bloqueo de esa mesa.");
    await r.actualizarReserva(txt(f, "id"), { inicio, fin, mesaId }, "reprogramada");
    return "Reserva reprogramada.";
  });
}

// ---------------- Mesas y bloqueos ----------------
export async function guardarMesa(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/mesas", "/reservas"], async () => {
    const datos = z.object({
      nombre: z.string().min(1, "Nombre requerido.").max(40),
      modalidad: z.enum(["carambola", "pool"]),
      tarifaHora: z.number().int().min(0).nullable(),
      orden: z.number().int(),
    }).parse({ nombre: txt(f, "nombre"), modalidad: txt(f, "modalidad"), tarifaHora: num(f, "tarifaHora"), orden: num(f, "orden") ?? 0 });
    await repoOError().guardarMesa({
      id: txt(f, "id") || undefined, ...datos, activa: bool(f, "activa"), mantenimiento: bool(f, "mantenimiento"), notas: txt(f, "notas") || undefined,
    });
    return "Mesa guardada.";
  });
}

export async function crearBloqueo(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/mesas", "/reservas"], async () => {
    const fecha = txt(f, "fecha");
    if (!esFechaValida(fecha)) throw new ErrorNegocio("Fecha inválida.");
    const aMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
    let ini = aMin(txt(f, "desde"));
    let fin = aMin(txt(f, "hasta"));
    if (ini < 6 * 60) ini += 1440;
    if (fin <= ini) fin += 1440;
    const tipo = z.enum(["bloqueo", "ocupada", "mantenimiento"]).parse(txt(f, "tipo"));
    const mesas = txt(f, "mesaId") === "todas" ? (await repoOError().listarMesas()).map((m) => m.id) : [txt(f, "mesaId")];
    for (const mesaId of mesas)
      await repoOError().crearBloqueo({ mesaId, tipo, motivo: txt(f, "motivo") || undefined, inicio: instanteBogota(fecha, ini).toISOString(), fin: instanteBogota(fecha, fin).toISOString() });
    return "Horario bloqueado.";
  });
}

export async function eliminarBloqueo(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/mesas", "/reservas"], async () => {
    await repoOError().eliminarBloqueo(txt(f, "id"));
    return "Bloqueo eliminado.";
  });
}

// ---------------- Escuela ----------------
export async function guardarClase(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/escuela", "/escuela"], async () => {
    const d = z.object({
      titulo: z.string().min(3, "Título requerido."),
      descripcion: z.string().max(600),
      modalidad: z.enum(["carambola", "pool", "ambas"]),
      nivel: z.enum(["Iniciación", "Básico", "Intermedio", "Avanzado", "Todos los niveles"]),
      duracionMin: z.number().int().min(15).max(480),
      precio: z.number().int().min(0).nullable(),
    }).parse({ titulo: txt(f, "titulo"), descripcion: txt(f, "descripcion"), modalidad: txt(f, "modalidad"), nivel: txt(f, "nivel"), duracionMin: num(f, "duracionMin"), precio: num(f, "precio") });
    await repoOError().guardarClase({
      id: txt(f, "id") || undefined, slug: txt(f, "slug") || slugify(d.titulo), ...d,
      instructorId: txt(f, "instructorId") || null, confirmada: bool(f, "confirmada"), activa: bool(f, "activa"),
    });
    return "Clase guardada.";
  });
}

export async function crearSesion(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/escuela", "/escuela"], async () => {
    const fecha = txt(f, "fecha");
    if (!esFechaValida(fecha)) throw new ErrorNegocio("Fecha inválida.");
    const [h, m] = txt(f, "hora").split(":").map(Number);
    const cupos = z.number().int().min(1).max(100).parse(num(f, "cupos"));
    await repoOError().guardarSesion({ claseId: txt(f, "claseId"), inicio: instanteBogota(fecha, h * 60 + m).toISOString(), cupos });
    return "Horario agregado.";
  });
}

export async function actualizarCupos(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/escuela", "/escuela"], async () => {
    const r = repoOError();
    const s = (await r.listarSesiones()).find((x) => x.id === txt(f, "id"));
    if (!s) throw new ErrorNegocio("Horario no encontrado.");
    await r.guardarSesion({ ...s, cupos: z.number().int().min(1).max(100).parse(num(f, "cupos")) });
    return "Cupos actualizados.";
  });
}

export async function eliminarSesion(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/escuela", "/escuela"], async () => {
    await repoOError().eliminarSesion(txt(f, "id"));
    return "Horario eliminado.";
  });
}

export async function guardarInstructor(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/escuela", "/escuela"], async () => {
    const nombre = z.string().min(3, "Nombre requerido.").parse(txt(f, "nombre"));
    await repoOError().guardarInstructor({ id: txt(f, "id") || undefined, nombre, bio: txt(f, "bio") || undefined, activo: bool(f, "activo") });
    return "Instructor guardado.";
  });
}

export async function estadoInscripcionClase(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/escuela", "/escuela"], async () => {
    const estado = z.enum(["pendiente", "confirmada", "cancelada"]).parse(txt(f, "estado"));
    await repoOError().actualizarInscripcionClase(txt(f, "id"), estado);
    return "Inscripción actualizada.";
  });
}

// ---------------- Torneos ----------------
const estadosTorneo: EstadoTorneo[] = ["borrador", "inscripciones_abiertas", "inscripciones_cerradas", "en_juego", "finalizado", "cancelado"];

export async function guardarTorneo(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/torneos", "/torneos"], async () => {
    const fecha = txt(f, "fecha");
    if (!esFechaValida(fecha)) throw new ErrorNegocio("Fecha inválida.");
    const [h, m] = (txt(f, "hora") || "14:00").split(":").map(Number);
    const d = z.object({
      nombre: z.string().min(3, "Nombre requerido."),
      modalidad: z.enum(["carambola", "pool"]),
      formato: z.string().max(200),
      requisitos: z.string().max(600),
      descripcion: z.string().max(1000),
      valorInscripcion: z.number().int().min(0).nullable(),
      cupos: z.number().int().min(2, "Mínimo 2 cupos.").max(256),
      estado: z.enum(estadosTorneo as [EstadoTorneo, ...EstadoTorneo[]]),
    }).parse({
      nombre: txt(f, "nombre"), modalidad: txt(f, "modalidad"), formato: txt(f, "formato"), requisitos: txt(f, "requisitos"), descripcion: txt(f, "descripcion"),
      valorInscripcion: num(f, "valorInscripcion"), cupos: num(f, "cupos"), estado: txt(f, "estado"),
    });
    const r = repoOError();
    const existente = txt(f, "id") ? (await r.listarTorneos()).find((t) => t.id === txt(f, "id")) : undefined;
    await r.guardarTorneo({
      id: existente?.id, slug: existente?.slug ?? slugify(`${d.nombre}-${fecha}`), ...d,
      fecha: instanteBogota(fecha, h * 60 + m).toISOString(), publicado: bool(f, "publicado"), esDemo: existente?.esDemo,
    });
    return "Torneo guardado.";
  });
}

export async function estadoInscripcionTorneo(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/torneos", "/torneos"], async () => {
    const estado = z.enum(["pendiente", "confirmada", "cancelada"]).parse(txt(f, "estado"));
    await repoOError().actualizarInscripcionTorneo(txt(f, "id"), estado);
    return "Inscripción actualizada.";
  });
}

/** Genera el cuadro de eliminación directa con los inscritos confirmados (orden de inscripción). */
export async function generarCuadro(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/torneos", "/torneos"], async () => {
    const r = repoOError();
    const torneoId = txt(f, "torneoId");
    const jugadores = (await r.listarInscripcionesTorneo(torneoId)).filter((i) => i.estado === "confirmada").map((i) => i.nombre);
    if (jugadores.length < 2) throw new ErrorNegocio("Se necesitan al menos 2 inscritos confirmados.");
    let tam = 2;
    while (tam < jugadores.length) tam *= 2;
    const rondas = Math.log2(tam);
    const partidos: Omit<Partido, "id" | "torneoId">[] = [];
    for (let k = 0; k < tam / 2; k++) {
      const a = jugadores[k * 2] ?? null;
      const b = jugadores[k * 2 + 1] ?? null;
      partidos.push({ ronda: 1, orden: k, jugadorA: a, jugadorB: b, marcadorA: null, marcadorB: null, ganador: a && !b ? "A" : null });
    }
    for (let ronda = 2; ronda <= rondas; ronda++)
      for (let k = 0; k < tam / 2 ** ronda; k++) partidos.push({ ronda, orden: k, jugadorA: null, jugadorB: null, marcadorA: null, marcadorB: null, ganador: null });
    await r.guardarPartidos(torneoId, avanzarGanadores(partidos));
    return "Cuadro generado.";
  });
}

/** Coloca a cada ganador en el partido siguiente. */
function avanzarGanadores(ps: Omit<Partido, "id" | "torneoId">[]) {
  const porRonda = (r: number) => ps.filter((p) => p.ronda === r).sort((a, b) => a.orden - b.orden);
  const max = Math.max(...ps.map((p) => p.ronda));
  for (let r = 1; r < max; r++) {
    for (const p of porRonda(r)) {
      const sig = porRonda(r + 1)[Math.floor(p.orden / 2)];
      const ganador = p.ganador === "A" ? p.jugadorA : p.ganador === "B" ? p.jugadorB : null;
      if (p.orden % 2 === 0) sig.jugadorA = ganador;
      else sig.jugadorB = ganador;
    }
  }
  return ps;
}

export async function guardarResultado(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/torneos", "/torneos"], async () => {
    const r = repoOError();
    const torneoId = txt(f, "torneoId");
    const partidos = await r.listarPartidos(torneoId);
    const p = partidos.find((x) => x.id === txt(f, "id"));
    if (!p) throw new ErrorNegocio("Partido no encontrado.");
    p.marcadorA = num(f, "marcadorA");
    p.marcadorB = num(f, "marcadorB");
    p.ganador = p.marcadorA != null && p.marcadorB != null && p.marcadorA !== p.marcadorB ? (p.marcadorA > p.marcadorB ? "A" : "B") : null;
    const sinIds = partidos.map((x) => ({ ronda: x.ronda, orden: x.orden, jugadorA: x.jugadorA, jugadorB: x.jugadorB, marcadorA: x.marcadorA, marcadorB: x.marcadorB, ganador: x.ganador }));
    await r.guardarPartidos(torneoId, avanzarGanadores(sinIds));
    return "Resultado guardado.";
  });
}

// ---------------- Eventos y contacto ----------------
export async function actualizarSolicitud(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/eventos"], async () => {
    const estado = z.enum(["nueva", "en_revision", "aprobada", "rechazada", "cerrada"]).parse(txt(f, "estado"));
    await repoOError().actualizarSolicitudEvento(txt(f, "id"), { estado, notas: txt(f, "notas") || undefined });
    return "Solicitud actualizada.";
  });
}

export async function marcarLeido(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/eventos"], async () => {
    await repoOError().marcarMensajeLeido(txt(f, "id"));
    return "Mensaje marcado como leído.";
  });
}

// ---------------- Galería ----------------
export async function subirFoto(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/galeria", "/galeria", "/"], async () => {
    const archivo = f.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) throw new ErrorNegocio("Selecciona una imagen.");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(archivo.type)) throw new ErrorNegocio("Formato no permitido (usa JPG, PNG, WebP o AVIF).");
    if (archivo.size > 8 * 1024 * 1024) throw new ErrorNegocio("La imagen supera 8 MB.");
    const alt = z.string().min(5, "Describe la foto (texto alternativo).").max(160).parse(txt(f, "alt"));
    // Optimiza a WebP (máx. 2400 px) y elimina metadatos EXIF (ubicación, etc.).
    const salida = await sharp(Buffer.from(await archivo.arrayBuffer())).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
    const r = repoOError();
    const src = await r.subirArchivo(`${slugify(alt).slice(0, 40)}.webp`, salida.data.buffer.slice(salida.data.byteOffset, salida.data.byteOffset + salida.data.byteLength) as ArrayBuffer, "image/webp");
    const total = (await r.listarGaleria()).length;
    await r.guardarFoto({
      src, alt, categoria: z.enum(["pool", "carambola", "ambiente", "detalle"]).parse(txt(f, "categoria")),
      ancho: salida.info.width, alto: salida.info.height, esReferencia: false, orden: bool(f, "destacar") ? -1 : total, visible: true,
    });
    return "Foto publicada.";
  });
}

export async function editarFoto(_: EstadoAccion, f: FormData) {
  return protegida(["/admin/galeria", "/galeria"], async () => {
    const r = repoOError();
    const foto = (await r.listarGaleria()).find((x) => x.id === txt(f, "id"));
    if (!foto) throw new ErrorNegocio("Foto no encontrada.");
    if (f.get("eliminar") === "1") {
      await r.eliminarFoto(foto.id);
      return "Foto eliminada.";
    }
    await r.guardarFoto({ ...foto, visible: bool(f, "visible"), orden: num(f, "orden") ?? foto.orden });
    return "Foto actualizada.";
  });
}

// ---------------- Configuración ----------------
export async function guardarAjustes(_: EstadoAccion, f: FormData) {
  return protegida(["/"], async () => {
    const aMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
    const apertura = aMin(txt(f, "apertura"));
    let cierre = aMin(txt(f, "cierre"));
    if (cierre <= apertura) cierre += 1440;
    const duraciones = txt(f, "duraciones").split(",").map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x >= 30 && x <= 600);
    if (!duraciones.length) throw new ErrorNegocio("Indica al menos una duración (en minutos).");
    await repoOError().guardarAjustes({
      modoReserva: z.enum(["manual", "automatica"]).parse(txt(f, "modoReserva")),
      duracionesMin: [...new Set(duraciones)].sort((a, b) => a - b),
      intervaloMin: z.number().int().min(15).max(120).parse(num(f, "intervaloMin")),
      anticipacionMinimaMin: z.number().int().min(0).max(2880).parse(num(f, "anticipacionMinimaMin")),
      diasMaximosAnticipacion: z.number().int().min(1).max(180).parse(num(f, "diasMaximosAnticipacion")),
      horaApertura: apertura,
      horaCierre: cierre,
      politicaReservas: z.string().min(10).max(1500).parse(txt(f, "politicaReservas")),
      textoHero: txt(f, "textoHero") || undefined,
      subtituloHero: txt(f, "subtituloHero") || undefined,
    });
    return "Configuración guardada.";
  });
}
