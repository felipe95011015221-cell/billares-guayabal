"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { Campo, Casilla, Entrada, Trampa, enviarJson } from "./campos";
import { Boton } from "@/components/ui/button";
import { inscripcionTorneoSchema } from "@/lib/validation";

type In = z.input<typeof inscripcionTorneoSchema>;
type Out = z.output<typeof inscripcionTorneoSchema>;

export function InscripcionTorneo({ torneoId }: { torneoId: string }) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(inscripcionTorneoSchema), defaultValues: { torneoId, nombre: "", celular: "", correo: "", documento: "", website: "" } });
  const e = form.formState.errors;

  const enviar = form.handleSubmit(async (d) => {
    setError(null);
    const r = await enviarJson<{ codigo: string }>("/api/formularios?tipo=torneo", d);
    if (r.ok) setCodigo(r.data.codigo);
    else {
      setError(r.error);
      if (r.campos) Object.entries(r.campos).forEach(([k, v]) => form.setError(k as keyof In, { message: v }));
    }
  });

  if (codigo)
    return (
      <div role="status" className="rounded-2xl border border-oro/40 bg-oro/10 p-6">
        <p className="flex items-center gap-2 font-display text-2xl text-oro"><Check className="h-5 w-5" />Inscripción recibida</p>
        <p className="mt-2 text-sm text-marfil/75">Código <strong className="font-mono">{codigo}</strong>. Tu inscripción queda <strong>pendiente de confirmación</strong> hasta que el club valide los requisitos y el pago.</p>
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <Trampa {...form.register("website")} />
      <Campo etiqueta="Nombre completo" id="t-nombre" error={e.nombre?.message}><Entrada id="t-nombre" autoComplete="name" invalido={!!e.nombre} {...form.register("nombre")} /></Campo>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Celular" id="t-cel" error={e.celular?.message}><Entrada id="t-cel" type="tel" inputMode="numeric" invalido={!!e.celular} {...form.register("celular")} /></Campo>
        <Campo etiqueta="Correo" id="t-correo" error={e.correo?.message}><Entrada id="t-correo" type="email" invalido={!!e.correo} {...form.register("correo")} /></Campo>
      </div>
      <Campo etiqueta="Documento (opcional)" id="t-doc" ayuda="Solo si el reglamento del torneo lo exige."><Entrada id="t-doc" inputMode="numeric" {...form.register("documento")} /></Campo>
      <Casilla id="t-req" error={e.aceptaReglamento?.message} etiqueta="Leí y acepto los requisitos y el formato del torneo." {...form.register("aceptaReglamento")} />
      <Casilla id="t-datos" error={e.aceptaDatos?.message} etiqueta="Autorizo el tratamiento de mis datos para gestionar la inscripción (Ley 1581 de 2012)." {...form.register("aceptaDatos")} />
      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm">{error}</p>}
      <Boton type="submit" tamaño="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}Inscribirme al torneo
      </Boton>
    </form>
  );
}
