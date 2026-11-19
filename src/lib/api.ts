import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { z } from "zod";
import { ErrorNegocio, repo } from "./data";
import type { Repositorio } from "./data/repository";
import { limitarIntentos } from "./auth";
import { erroresDeZod } from "./validation";

export type RespuestaApi<T> = { ok: true; data: T } | { ok: false; error: string; campos?: Record<string, string> };

export const okJson = <T>(data: T, status = 200) => NextResponse.json({ ok: true, data } satisfies RespuestaApi<T>, { status });
export const errorJson = (error: string, status = 400, campos?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, campos } satisfies RespuestaApi<never>, { status });

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/**
 * Envoltorio común para formularios públicos: límite de envíos por IP, validación Zod en servidor,
 * verificación de que la base de datos esté configurada y traducción de errores de negocio.
 */
export async function manejarFormulario<S extends z.ZodType, T>(
  req: Request,
  schema: S,
  nombre: string,
  accion: (datos: z.output<S>, r: Repositorio) => Promise<T>,
  limite = 8,
) {
  const r = repo();
  if (!r) return errorJson("Este formulario aún no está activo. Escríbenos por WhatsApp y con gusto te atendemos.", 503);
  if (!limitarIntentos(`${nombre}:${await ip()}`, limite, 10 * 60_000))
    return errorJson("Has enviado demasiadas solicitudes. Intenta de nuevo en unos minutos.", 429);
  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return errorJson("Solicitud inválida.");
  }
  const parsed = schema.safeParse(cuerpo);
  if (!parsed.success) return errorJson("Revisa los campos marcados.", 422, erroresDeZod(parsed.error));
  try {
    return okJson(await accion(parsed.data, r), 201);
  } catch (e) {
    if (e instanceof ErrorNegocio) return errorJson(e.message, e.codigo === "conflicto" || e.codigo === "sin_cupos" ? 409 : 400);
    console.error(`[${nombre}]`, e);
    return errorJson("No pudimos procesar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.", 500);
  }
}
