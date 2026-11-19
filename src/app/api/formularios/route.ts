import { manejarFormulario, errorJson } from "@/lib/api";
import { ErrorNegocio } from "@/lib/data";
import { hoyBogota } from "@/lib/time";
import { contactoSchema, inscripcionClaseSchema, inscripcionTorneoSchema, solicitudEventoSchema } from "@/lib/validation";

/**
 * Formularios públicos: /api/formularios?tipo=clase|torneo|evento|contacto
 * Toda la validación se repite en el servidor.
 */
export async function POST(req: Request) {
  const tipo = new URL(req.url).searchParams.get("tipo");

  if (tipo === "clase")
    return manejarFormulario(req, inscripcionClaseSchema, "clase", async (d, r) => {
      const ins = await r.inscribirClase({ sesionId: d.sesionId, nombre: d.nombre, celular: d.celular, correo: d.correo, nivelDeclarado: d.nivelDeclarado });
      return { codigo: ins.codigo, estado: ins.estado };
    });

  if (tipo === "torneo")
    return manejarFormulario(req, inscripcionTorneoSchema, "torneo", async (d, r) => {
      const ins = await r.inscribirTorneo({ torneoId: d.torneoId, nombre: d.nombre, celular: d.celular, correo: d.correo, documento: d.documento });
      return { codigo: ins.codigo, estado: ins.estado };
    });

  if (tipo === "evento")
    return manejarFormulario(req, solicitudEventoSchema, "evento", async (d, r) => {
      if (d.fecha <= hoyBogota()) throw new ErrorNegocio("Elige una fecha futura.");
      const s = await r.crearSolicitudEvento({
        tipo: d.tipo, fecha: d.fecha, participantes: d.participantes, nombre: d.nombre, celular: d.celular,
        correo: d.correo, empresa: d.empresa, mensaje: d.mensaje,
      });
      return { codigo: s.codigo };
    }, 5);

  if (tipo === "contacto")
    return manejarFormulario(req, contactoSchema, "contacto", async (d, r) => {
      await r.crearMensaje({ nombre: d.nombre, correo: d.correo, celular: d.celular, asunto: d.asunto, mensaje: d.mensaje });
      return { recibido: true };
    }, 5);

  return errorJson("Formulario desconocido.", 404);
}
