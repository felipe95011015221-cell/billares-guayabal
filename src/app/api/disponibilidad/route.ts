import { estadoMesa, franjasDisponibles, validarHorario, valorEstimado } from "@/lib/availability";
import { errorJson, okJson } from "@/lib/api";
import { repo } from "@/lib/data";
import { instanteBogota, sumarDias } from "@/lib/time";
import { consultaDisponibilidadSchema, erroresDeZod } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Disponibilidad en tiempo real calculada en el servidor. */
export async function GET(req: Request) {
  const r = repo();
  if (!r) return errorJson("Las reservas en línea aún no están activas.", 503);
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = consultaDisponibilidadSchema.safeParse(params);
  if (!parsed.success) return errorJson("Parámetros inválidos.", 422, erroresDeZod(parsed.error));
  const { modalidad, fecha, duracion, inicio } = parsed.data;

  const ajustes = await r.obtenerAjustes();
  if (!ajustes.duracionesMin.includes(duracion)) return errorJson("Duración no permitida.", 422);
  const desde = instanteBogota(fecha, 0).toISOString();
  const hasta = instanteBogota(sumarDias(fecha, 2), 0).toISOString();
  const [mesas, reservas, bloqueos] = await Promise.all([r.listarMesas(), r.listarReservas(desde, hasta), r.listarBloqueos(desde, hasta)]);
  const visibles = mesas.filter((m) => m.activa);

  const franjas = franjasDisponibles({ fecha, duracionMin: duracion, modalidad, mesas: visibles, reservas, bloqueos, ajustes });

  let detalleMesas = null;
  if (inicio !== undefined) {
    const v = validarHorario(fecha, inicio, duracion, ajustes);
    if (!v.ok) return errorJson(v.error!, 422);
    const rango = { inicio: instanteBogota(fecha, inicio).getTime(), fin: instanteBogota(fecha, inicio + duracion).getTime() };
    detalleMesas = visibles
      .filter((m) => m.modalidad === modalidad)
      .map((m) => ({
        id: m.id,
        nombre: m.nombre,
        modalidad: m.modalidad,
        tarifaHora: m.tarifaHora,
        valorEstimado: valorEstimado(m, duracion),
        estado: estadoMesa(m, rango, reservas, bloqueos),
      }));
  }

  return okJson({ franjas, mesas: detalleMesas, modoReserva: ajustes.modoReserva, duraciones: ajustes.duracionesMin });
}
