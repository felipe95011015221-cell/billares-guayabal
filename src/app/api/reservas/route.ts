import { validarHorario, valorEstimado } from "@/lib/availability";
import { manejarFormulario } from "@/lib/api";
import { ErrorNegocio } from "@/lib/data";
import { instanteBogota } from "@/lib/time";
import { reservaSchema } from "@/lib/validation";

export async function POST(req: Request) {
  return manejarFormulario(req, reservaSchema, "reserva", async (d, r) => {
    const ajustes = await r.obtenerAjustes();
    const v = validarHorario(d.fecha, d.inicio, d.duracion, ajustes);
    if (!v.ok) throw new ErrorNegocio(v.error!);
    const mesa = (await r.listarMesas()).find((m) => m.id === d.mesaId);
    if (!mesa || !mesa.activa) throw new ErrorNegocio("La mesa seleccionada no está disponible.", "no_encontrado");

    // crearReserva vuelve a verificar disponibilidad de forma atómica (y la BD lo garantiza con una restricción de exclusión).
    const reserva = await r.crearReserva({
      mesaId: mesa.id,
      modalidad: d.modalidad,
      inicio: instanteBogota(d.fecha, d.inicio).toISOString(),
      fin: instanteBogota(d.fecha, d.inicio + d.duracion).toISOString(),
      nombre: d.nombre,
      celular: d.celular,
      correo: d.correo,
      estado: ajustes.modoReserva === "automatica" ? "confirmada" : "pendiente",
      valorEstimado: valorEstimado(mesa, d.duracion),
    });
    return {
      codigo: reserva.codigo,
      estado: reserva.estado,
      inicio: reserva.inicio,
      fin: reserva.fin,
      mesa: mesa.nombre,
      modalidad: reserva.modalidad,
      valorEstimado: reserva.valorEstimado,
    };
  }, 6);
}
