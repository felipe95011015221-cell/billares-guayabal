import { manejarFormulario } from "@/lib/api";
import { ErrorNegocio } from "@/lib/data";
import { normalizarCelular } from "@/lib/format";
import { consultaReservaSchema } from "@/lib/validation";

/** Consulta de reserva: exige código + celular para no exponer datos de terceros. */
export async function POST(req: Request) {
  return manejarFormulario(req, consultaReservaSchema, "consulta", async (d, r) => {
    const reserva = await r.obtenerReservaPorCodigo(d.codigo);
    if (!reserva || normalizarCelular(reserva.celular) !== d.celular)
      throw new ErrorNegocio("No encontramos una reserva con ese código y celular.", "no_encontrado");
    const mesa = (await r.listarMesas()).find((m) => m.id === reserva.mesaId);
    return {
      codigo: reserva.codigo,
      estado: reserva.estado,
      inicio: reserva.inicio,
      fin: reserva.fin,
      mesa: mesa?.nombre ?? "Mesa",
      modalidad: reserva.modalidad,
      nombre: reserva.nombre.split(" ")[0],
      valorEstimado: reserva.valorEstimado,
    };
  }, 15);
}
