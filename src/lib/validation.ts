import { z } from "zod";
import { esFechaValida } from "./time";

const nombre = z.string().trim().min(3, "Escribe tu nombre completo.").max(80, "Máximo 80 caracteres.");
const celular = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, "").replace(/^57(?=\d{10}$)/, ""))
  .refine((v) => /^3\d{9}$/.test(v), "Ingresa un celular colombiano de 10 dígitos (ej. 3001234567).");
const correo = z.string().trim().toLowerCase().email("Ingresa un correo válido.").max(120);
const fecha = z.string().refine(esFechaValida, "Fecha no válida.");
/** Campo trampa anti-spam: los humanos lo dejan vacío. */
const honeypot = z.string().max(0).optional().or(z.literal(""));
const aceptaDatos = z.literal(true, { error: "Debes autorizar el tratamiento de datos personales." });

export const modalidadSchema = z.enum(["carambola", "pool"]);

export const consultaDisponibilidadSchema = z.object({
  modalidad: modalidadSchema,
  fecha,
  duracion: z.coerce.number().int().positive(),
  inicio: z.coerce.number().int().min(0).max(48 * 60).optional(),
});

export const reservaSchema = z.object({
  modalidad: modalidadSchema,
  fecha,
  inicio: z.number().int().min(0).max(48 * 60),
  duracion: z.number().int().positive(),
  mesaId: z.string().min(1, "Selecciona una mesa."),
  nombre,
  celular,
  correo,
  aceptaDatos,
  website: honeypot,
});
export type ReservaInput = z.input<typeof reservaSchema>;

export const consultaReservaSchema = z.object({
  codigo: z.string().trim().toUpperCase().regex(/^BG-[A-Z0-9]{6}$/, "El código tiene el formato BG-XXXXXX."),
  celular,
});

export const inscripcionClaseSchema = z.object({
  sesionId: z.string().min(1, "Selecciona un horario."),
  nombre,
  celular,
  correo,
  nivelDeclarado: z.string().trim().max(60).optional(),
  aceptaDatos,
  website: honeypot,
});

export const inscripcionTorneoSchema = z.object({
  torneoId: z.string().min(1),
  nombre,
  celular,
  correo,
  documento: z.string().trim().max(20).optional(),
  aceptaDatos,
  aceptaReglamento: z.literal(true, { error: "Debes aceptar los requisitos del torneo." }),
  website: honeypot,
});

export const solicitudEventoSchema = z.object({
  tipo: z.enum(["privado", "empresarial", "celebracion", "recreativo", "grupal"]),
  fecha,
  participantes: z.coerce.number().int().min(2, "Mínimo 2 participantes.").max(300, "Para grupos más grandes, escríbenos."),
  nombre,
  celular,
  correo,
  empresa: z.string().trim().max(80).optional(),
  mensaje: z.string().trim().max(1000).optional(),
  aceptaDatos,
  website: honeypot,
});

export const contactoSchema = z.object({
  nombre,
  correo,
  celular: z.string().trim().max(20).optional(),
  asunto: z.enum(["reservas", "clases", "torneos", "eventos", "otro"]),
  mensaje: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres).").max(1500),
  aceptaDatos,
  website: honeypot,
});

export function erroresDeZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = issue.path.join(".") || "_";
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
