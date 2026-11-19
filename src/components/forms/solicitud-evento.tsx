"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { AreaTexto, Campo, Casilla, Entrada, Selector, Trampa, enviarJson } from "./campos";
import { Boton } from "@/components/ui/button";
import { TIPOS_EVENTO } from "@/lib/types";
import { solicitudEventoSchema } from "@/lib/validation";
import { enlaceWhatsApp } from "@/lib/whatsapp";

type In = z.input<typeof solicitudEventoSchema>;
type Out = z.output<typeof solicitudEventoSchema>;

export function SolicitudEvento({ manana }: { manana: string }) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(solicitudEventoSchema),
    defaultValues: { tipo: "privado", fecha: "", participantes: 10, nombre: "", celular: "", correo: "", empresa: "", mensaje: "", website: "" },
  });
  const e = form.formState.errors;

  const enviar = form.handleSubmit(async (d) => {
    setError(null);
    const r = await enviarJson<{ codigo: string }>("/api/formularios?tipo=evento", d);
    if (r.ok) setCodigo(r.data.codigo);
    else {
      setError(r.error);
      if (r.campos) Object.entries(r.campos).forEach(([k, v]) => form.setError(k as keyof In, { message: v }));
    }
  });

  if (codigo) {
    const d = form.getValues();
    return (
      <div role="status" className="rounded-3xl border border-verde/30 bg-[#fbf8f1] p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-verde" />
        <h3 className="mt-4 font-display text-4xl">Solicitud recibida</h3>
        <p className="mx-auto mt-3 max-w-md text-carbon/70">Código <strong className="font-mono">{codigo}</strong>. Tu solicitud está sujeta a disponibilidad y aprobación del club; te contactaremos para revisar los detalles.</p>
        <a href={enlaceWhatsApp("eventos", `Código de solicitud: ${codigo}. Fecha: ${d.fecha}. Participantes: ${d.participantes}.`)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-verde">Agilizar por WhatsApp →</a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <Trampa {...form.register("website")} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Campo etiqueta="Tipo de evento" id="ev-tipo" className="sm:col-span-3">
          <Selector id="ev-tipo" {...form.register("tipo")}>{TIPOS_EVENTO.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</Selector>
        </Campo>
        <Campo etiqueta="Fecha deseada" id="ev-fecha" error={e.fecha?.message} className="sm:col-span-2">
          <Entrada id="ev-fecha" type="date" min={manana} invalido={!!e.fecha} {...form.register("fecha")} />
        </Campo>
        <Campo etiqueta="Participantes" id="ev-n" error={e.participantes?.message}>
          <Entrada id="ev-n" type="number" min={2} max={300} inputMode="numeric" invalido={!!e.participantes} {...form.register("participantes")} />
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre" id="ev-nombre" error={e.nombre?.message}><Entrada id="ev-nombre" autoComplete="name" invalido={!!e.nombre} {...form.register("nombre")} /></Campo>
        <Campo etiqueta="Empresa (opcional)" id="ev-emp"><Entrada id="ev-emp" autoComplete="organization" {...form.register("empresa")} /></Campo>
        <Campo etiqueta="Celular" id="ev-cel" error={e.celular?.message}><Entrada id="ev-cel" type="tel" inputMode="numeric" invalido={!!e.celular} {...form.register("celular")} /></Campo>
        <Campo etiqueta="Correo" id="ev-correo" error={e.correo?.message}><Entrada id="ev-correo" type="email" invalido={!!e.correo} {...form.register("correo")} /></Campo>
      </div>
      <Campo etiqueta="Cuéntanos tu idea (opcional)" id="ev-msg" error={e.mensaje?.message}><AreaTexto id="ev-msg" placeholder="Horario aproximado, si quieren torneo interno, clase grupal…" {...form.register("mensaje")} /></Campo>
      <Casilla id="ev-datos" error={e.aceptaDatos?.message} etiqueta="Autorizo el tratamiento de mis datos para responder esta solicitud (Ley 1581 de 2012)." {...form.register("aceptaDatos")} />
      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm">{error}</p>}
      <Boton type="submit" variante="verde" tamaño="lg" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
        {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}Enviar solicitud
      </Boton>
    </form>
  );
}
