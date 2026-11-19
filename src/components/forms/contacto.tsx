"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { AreaTexto, Campo, Casilla, Entrada, Selector, Trampa, enviarJson } from "./campos";
import { Boton } from "@/components/ui/button";
import { contactoSchema } from "@/lib/validation";

type In = z.input<typeof contactoSchema>;
type Out = z.output<typeof contactoSchema>;

export function FormularioContacto() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(contactoSchema), defaultValues: { nombre: "", correo: "", celular: "", asunto: "reservas", mensaje: "", website: "" } });
  const e = form.formState.errors;

  const enviar = form.handleSubmit(async (d) => {
    setError(null);
    const r = await enviarJson("/api/formularios?tipo=contacto", d);
    if (r.ok) setEnviado(true);
    else setError(r.error);
  });

  if (enviado)
    return (
      <div role="status" className="rounded-2xl border border-oro/30 bg-oro/10 p-8">
        <p className="flex items-center gap-2 font-display text-3xl text-oro"><Check className="h-6 w-6" />Mensaje enviado</p>
        <p className="mt-2 text-marfil/70">Gracias por escribirnos. Te responderemos lo antes posible.</p>
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <Trampa {...form.register("website")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre" id="co-nombre" error={e.nombre?.message}><Entrada id="co-nombre" autoComplete="name" invalido={!!e.nombre} {...form.register("nombre")} /></Campo>
        <Campo etiqueta="Asunto" id="co-asunto">
          <Selector id="co-asunto" {...form.register("asunto")}>
            <option value="reservas">Reservas</option><option value="clases">Clases</option><option value="torneos">Torneos</option><option value="eventos">Eventos</option><option value="otro">Otro</option>
          </Selector>
        </Campo>
        <Campo etiqueta="Correo" id="co-correo" error={e.correo?.message}><Entrada id="co-correo" type="email" autoComplete="email" invalido={!!e.correo} {...form.register("correo")} /></Campo>
        <Campo etiqueta="Celular (opcional)" id="co-cel"><Entrada id="co-cel" type="tel" inputMode="numeric" {...form.register("celular")} /></Campo>
      </div>
      <Campo etiqueta="Mensaje" id="co-msg" error={e.mensaje?.message}><AreaTexto id="co-msg" invalido={!!e.mensaje} {...form.register("mensaje")} /></Campo>
      <Casilla id="co-datos" error={e.aceptaDatos?.message} etiqueta="Autorizo el tratamiento de mis datos para responder este mensaje (Ley 1581 de 2012)." {...form.register("aceptaDatos")} />
      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm">{error}</p>}
      <Boton type="submit" tamaño="lg" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}Enviar mensaje</Boton>
    </form>
  );
}
