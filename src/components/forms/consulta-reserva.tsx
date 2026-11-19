"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { Campo, Entrada, enviarJson } from "./campos";
import { Boton } from "@/components/ui/button";
import { Insignia } from "@/components/ui/primitives";
import { IconoWhatsApp } from "@/components/icons";
import { formatoCOP } from "@/lib/format";
import { formatoFecha, formatoHora } from "@/lib/time";
import type { EstadoReserva } from "@/lib/types";
import { consultaReservaSchema } from "@/lib/validation";
import { ESTADO_RESERVA_UI } from "@/lib/estados";
import { enlaceWhatsApp } from "@/lib/whatsapp";

type In = z.input<typeof consultaReservaSchema>;
type Out = z.output<typeof consultaReservaSchema>;
interface Res { codigo: string; estado: EstadoReserva; inicio: string; fin: string; mesa: string; modalidad: string; nombre: string; valorEstimado: number | null }


export function ConsultaReserva() {
  const [res, setRes] = useState<Res | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(consultaReservaSchema), defaultValues: { codigo: "", celular: "" } });

  const enviar = form.handleSubmit(async (d) => {
    setError(null);
    setRes(null);
    const r = await enviarJson<Res>("/api/reservas/consultar", d);
    if (r.ok) setRes(r.data);
    else setError(r.error);
  });

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={enviar} noValidate className="space-y-6">
        <Campo etiqueta="Código de reserva" id="codigo" error={form.formState.errors.codigo?.message}>
          <Entrada id="codigo" placeholder="BG-XXXXXX" autoCapitalize="characters" className="font-mono uppercase tracking-[0.14em]" invalido={!!form.formState.errors.codigo} {...form.register("codigo")} />
        </Campo>
        <Campo etiqueta="Celular con el que reservaste" id="celular" error={form.formState.errors.celular?.message}>
          <Entrada id="celular" type="tel" inputMode="numeric" invalido={!!form.formState.errors.celular} {...form.register("celular")} />
        </Campo>
        <Boton type="submit" tamaño="lg" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Consultar
        </Boton>
        {error && <p role="alert" className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm">{error}</p>}
      </form>

      <div aria-live="polite">
        {res ? (
          <div className="rounded-3xl border border-oro/30 bg-carbon-2 p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-2xl tracking-[0.14em] text-oro">{res.codigo}</p>
              <Insignia tono={ESTADO_RESERVA_UI[res.estado].tono}>{ESTADO_RESERVA_UI[res.estado].texto}</Insignia>
            </div>
            <p className="mt-6 font-display text-3xl">Hola, {res.nombre}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-marfil/50">Fecha</dt><dd className="text-right first-letter:uppercase">{formatoFecha(res.inicio)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-marfil/50">Horario</dt><dd>{formatoHora(res.inicio)} – {formatoHora(res.fin)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-marfil/50">Mesa</dt><dd>{res.mesa} · {res.modalidad === "pool" ? "Pool" : "Carambola"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-marfil/50">Valor estimado</dt><dd>{formatoCOP(res.valorEstimado)}</dd></div>
            </dl>
            <a href={enlaceWhatsApp("reservas", `Mi código de reserva es ${res.codigo}.`)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-oro">
              <IconoWhatsApp className="h-4 w-4" /> Cambiar o cancelar por WhatsApp
            </a>
          </div>
        ) : (
          <div className="flex h-full min-h-60 items-center justify-center rounded-3xl border border-dashed border-marfil/15 p-8 text-center text-sm text-marfil/50">
            Ingresa tu código y celular para ver el estado de tu reserva.
          </div>
        )}
      </div>
    </div>
  );
}
