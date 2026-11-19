"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { Campo, Casilla, Entrada, Selector, Trampa, enviarJson } from "./campos";
import { Boton } from "@/components/ui/button";
import { cn } from "@/lib/format";
import { formatoFechaCorta, formatoHora } from "@/lib/time";
import { inscripcionClaseSchema } from "@/lib/validation";
import type { SesionPublica } from "@/lib/public-data";

type In = z.input<typeof inscripcionClaseSchema>;
type Out = z.output<typeof inscripcionClaseSchema>;

/** Selección de horario + formulario de inscripción a una clase. */
export function InscripcionClase({ sesiones, titulo, confirmada }: { sesiones: SesionPublica[]; titulo: string; confirmada: boolean }) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(inscripcionClaseSchema), defaultValues: { sesionId: "", nombre: "", celular: "", correo: "", website: "" } });
  const sesionId = form.watch("sesionId");

  const enviar = form.handleSubmit(async (d) => {
    setError(null);
    const r = await enviarJson<{ codigo: string }>("/api/formularios?tipo=clase", d);
    if (r.ok) setCodigo(r.data.codigo);
    else {
      setError(r.error);
      if (r.campos) Object.entries(r.campos).forEach(([k, v]) => form.setError(k as keyof In, { message: v }));
    }
  });

  if (codigo)
    return (
      <div className="rounded-2xl border border-verde/30 bg-verde/5 p-6" role="status">
        <p className="flex items-center gap-2 font-display text-2xl text-verde"><Check className="h-5 w-5" />{confirmada ? "Inscripción recibida" : "Pre-inscripción recibida"}</p>
        <p className="mt-2 text-sm text-carbon/70">
          Tu código es <strong className="font-mono">{codigo}</strong>. Tu cupo queda <strong>pendiente de confirmación</strong>: el club te contactará para confirmar el horario
          {confirmada ? " y el pago." : ", el instructor y el valor del programa."}
        </p>
      </div>
    );

  if (!sesiones.length)
    return <p className="rounded-xl border border-dashed border-carbon/20 p-5 text-sm text-carbon/60">Aún no hay horarios publicados para {titulo}. Escríbenos por WhatsApp para dejar tu interés.</p>;

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <Trampa {...form.register("website")} />
      <fieldset>
        <legend className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-70">Escoge un horario</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sesiones.map((s) => {
            const lleno = s.disponibles <= 0;
            return (
              <label
                key={s.id}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border p-3 text-sm transition",
                  sesionId === s.id ? "border-verde bg-verde text-marfil" : "border-carbon/15 hover:border-verde/50",
                  lleno && "cursor-not-allowed opacity-40",
                )}
              >
                <input type="radio" value={s.id} disabled={lleno} className="sr-only" {...form.register("sesionId")} />
                <span className="font-semibold">{formatoFechaCorta(s.inicio)}</span>
                <span className="opacity-75">{formatoHora(s.inicio)}</span>
                <span className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] opacity-70">{lleno ? "Sin cupos" : `${s.disponibles} cupo${s.disponibles > 1 ? "s" : ""}`}</span>
              </label>
            );
          })}
        </div>
        {form.formState.errors.sesionId && <p role="alert" className="mt-2 text-sm text-error">{form.formState.errors.sesionId.message}</p>}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre" id={`n-${titulo}`} error={form.formState.errors.nombre?.message}>
          <Entrada id={`n-${titulo}`} autoComplete="name" invalido={!!form.formState.errors.nombre} {...form.register("nombre")} />
        </Campo>
        <Campo etiqueta="Celular" id={`c-${titulo}`} error={form.formState.errors.celular?.message}>
          <Entrada id={`c-${titulo}`} type="tel" inputMode="numeric" autoComplete="tel-national" invalido={!!form.formState.errors.celular} {...form.register("celular")} />
        </Campo>
        <Campo etiqueta="Correo" id={`e-${titulo}`} error={form.formState.errors.correo?.message}>
          <Entrada id={`e-${titulo}`} type="email" autoComplete="email" invalido={!!form.formState.errors.correo} {...form.register("correo")} />
        </Campo>
        <Campo etiqueta="Tu nivel" id={`l-${titulo}`}>
          <Selector id={`l-${titulo}`} {...form.register("nivelDeclarado")}>
            <option value="">Selecciona…</option>
            <option>Nunca he jugado</option>
            <option>Juego ocasionalmente</option>
            <option>Juego con frecuencia</option>
            <option>Compito</option>
          </Selector>
        </Campo>
      </div>
      <Casilla id={`a-${titulo}`} error={form.formState.errors.aceptaDatos?.message} etiqueta="Autorizo el tratamiento de mis datos para gestionar esta inscripción (Ley 1581 de 2012)." {...form.register("aceptaDatos")} />
      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm">{error}</p>}
      <Boton type="submit" variante="verde" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {confirmada ? "Inscribirme" : "Pre-inscribirme"}
      </Boton>
    </form>
  );
}
