import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cambiarEstadoReserva, guardarObservacion, reprogramarReserva } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Etq, Panel, TituloAdmin, Vacio, campoAdmin } from "@/components/admin/ui";
import { Insignia } from "@/components/ui/primitives";
import { repoOError } from "@/lib/data";
import { ESTADO_RESERVA_UI } from "@/lib/estados";
import { cn, formatoCOP } from "@/lib/format";
import { esFechaValida, formatoFecha, formatoFechaCorta, formatoFechaLocal, formatoHora, hoyBogota, instanteBogota, minutosDesdeFecha, sumarDias } from "@/lib/time";
import type { Reserva } from "@/lib/types";

export default async function AdminReservas({ searchParams }: { searchParams: Promise<{ fecha?: string; vista?: string }> }) {
  const sp = await searchParams;
  const fecha = sp.fecha && esFechaValida(sp.fecha) ? sp.fecha : hoyBogota();
  const historial = sp.vista === "historial";
  const r = repoOError();
  const [mesas, ajustes] = await Promise.all([r.listarMesas(), r.obtenerAjustes()]);
  const desde = instanteBogota(fecha, ajustes.horaApertura).toISOString();
  const hasta = instanteBogota(fecha, ajustes.horaCierre).toISOString();
  const [reservas, bloqueos] = historial
    ? [await r.listarReservasRecientes(200), []]
    : await Promise.all([r.listarReservas(desde, hasta), r.listarBloqueos(desde, hasta)]);
  const nombreMesa = (id: string) => mesas.find((m) => m.id === id)?.nombre ?? "—";

  return (
    <>
      <TituloAdmin
        titulo="Reservas"
        texto="Confirma, reprograma o cancela. Las solicitudes nuevas quedan pendientes hasta que las confirmes."
        acciones={
          <div className="flex gap-2 text-xs">
            <Link href="/admin/reservas" className={cn("rounded-full border px-4 py-2", !historial ? "border-oro text-oro" : "border-marfil/15")}>Calendario</Link>
            <Link href="/admin/reservas?vista=historial" className={cn("rounded-full border px-4 py-2", historial ? "border-oro text-oro" : "border-marfil/15")}>Historial</Link>
          </div>
        }
      />

      {!historial && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link href={`/admin/reservas?fecha=${sumarDias(fecha, -1)}`} aria-label="Día anterior" className="flex h-10 w-10 items-center justify-center rounded-full border border-marfil/15 hover:border-oro"><ChevronLeft className="h-4 w-4" /></Link>
            <p className="min-w-56 text-center font-display text-2xl first-letter:uppercase">{formatoFechaLocal(fecha)}</p>
            <Link href={`/admin/reservas?fecha=${sumarDias(fecha, 1)}`} aria-label="Día siguiente" className="flex h-10 w-10 items-center justify-center rounded-full border border-marfil/15 hover:border-oro"><ChevronRight className="h-4 w-4" /></Link>
            <form className="flex gap-2">
              <input type="date" name="fecha" defaultValue={fecha} className={cn(campoAdmin, "w-44")} />
              <button className="rounded-full border border-marfil/15 px-4 text-xs uppercase tracking-[0.1em] hover:border-oro">Ir</button>
            </form>
            {fecha !== hoyBogota() && <Link href="/admin/reservas" className="text-xs uppercase tracking-[0.12em] text-oro">Hoy</Link>}
          </div>

          <Panel titulo="Calendario del día" className="mb-6">
            <LineaTiempo fecha={fecha} apertura={ajustes.horaApertura} cierre={ajustes.horaCierre} mesas={mesas} reservas={reservas} bloqueos={bloqueos} />
          </Panel>
        </>
      )}

      <Panel titulo={historial ? "Historial (últimas 200)" : `Reservas del día (${reservas.length})`}>
        {reservas.length === 0 ? <Vacio>No hay reservas {historial ? "registradas" : "para este día"}.</Vacio> : (
          <ul className="space-y-3">
            {reservas.map((x) => <TarjetaReserva key={x.id} x={x} mesa={nombreMesa(x.mesaId)} mesas={mesas.map((m) => ({ id: m.id, nombre: `${m.nombre} · ${m.modalidad}` }))} />)}
          </ul>
        )}
      </Panel>
    </>
  );
}

function LineaTiempo({ fecha, apertura, cierre, mesas, reservas, bloqueos }: {
  fecha: string; apertura: number; cierre: number; mesas: { id: string; nombre: string; modalidad: string; activa: boolean; mantenimiento: boolean }[];
  reservas: Reserva[]; bloqueos: { id: string; mesaId: string; inicio: string; fin: string; tipo: string }[];
}) {
  const total = cierre - apertura;
  const pos = (iso: string) => Math.min(100, Math.max(0, ((minutosDesdeFecha(fecha, iso) - apertura) / total) * 100));
  const horas = Array.from({ length: Math.floor(total / 60) + 1 }, (_, i) => apertura + i * 60);
  const color: Record<string, string> = { pendiente: "border border-dashed border-alerta bg-alerta/20 text-alerta", confirmada: "bg-oro text-carbon", en_curso: "bg-error/80 text-white" };
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <div className="min-w-[860px]">
        <div className="relative ml-28 h-6 text-[0.6rem] text-marfil/40">
          {horas.map((h) => <span key={h} className="absolute -translate-x-1/2" style={{ left: `${((h - apertura) / total) * 100}%` }}>{(Math.floor(h / 60) % 24).toString().padStart(2, "0")}h</span>)}
        </div>
        <ul className="space-y-1.5">
          {mesas.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <span className="w-25 shrink-0 truncate text-xs">{m.nombre}<span className="block text-[0.6rem] capitalize text-marfil/40">{m.modalidad}{m.mantenimiento ? " · mant." : ""}</span></span>
              <div className={cn("relative h-10 flex-1 rounded-md border border-marfil/5 bg-marfil/[0.03]", (!m.activa || m.mantenimiento) && "bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgb(242_235_221/0.06)_6px,rgb(242_235_221/0.06)_12px)]")}>
                {horas.map((h) => <span key={h} className="absolute inset-y-0 w-px bg-marfil/5" style={{ left: `${((h - apertura) / total) * 100}%` }} />)}
                {bloqueos.filter((b) => b.mesaId === m.id).map((b) => (
                  <span key={b.id} title={`${b.tipo}`} className="absolute inset-y-1 rounded bg-marfil/20 px-1.5 text-[0.6rem] leading-8 text-marfil/80" style={{ left: `${pos(b.inicio)}%`, width: `${pos(b.fin) - pos(b.inicio)}%` }}>{b.tipo}</span>
                ))}
                {reservas.filter((x) => x.mesaId === m.id && color[x.estado]).map((x) => (
                  <span key={x.id} title={`${x.nombre} · ${x.codigo}`} className={cn("absolute inset-y-1 overflow-hidden whitespace-nowrap rounded px-1.5 text-[0.62rem] font-medium leading-8", color[x.estado])} style={{ left: `${pos(x.inicio)}%`, width: `${pos(x.fin) - pos(x.inicio)}%` }}>
                    {formatoHora(x.inicio)} {x.nombre.split(" ")[0]}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap gap-4 text-[0.65rem] uppercase tracking-[0.12em] text-marfil/50">
          <span className="flex items-center gap-1.5"><i className="h-2 w-3 rounded-sm border border-dashed border-alerta bg-alerta/20" />Pendiente</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-3 rounded-sm bg-oro" />Confirmada</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-3 rounded-sm bg-error/80" />En curso</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-3 rounded-sm bg-marfil/20" />Bloqueo</span>
        </p>
      </div>
    </div>
  );
}

function TarjetaReserva({ x, mesa, mesas }: { x: Reserva; mesa: string; mesas: { id: string; nombre: string }[] }) {
  const ui = ESTADO_RESERVA_UI[x.estado];
  const dur = Math.round((new Date(x.fin).getTime() - new Date(x.inicio).getTime()) / 60000);
  const fechaLocal = new Date(new Date(x.inicio).getTime() - 5 * 3600_000).toISOString();
  const transiciones: { estado: string; t: string; v: "oro" | "sutil" | "peligro" | "verde"; c?: string }[] =
    x.estado === "pendiente" ? [{ estado: "confirmada", t: "Confirmar", v: "oro" }, { estado: "rechazada", t: "Rechazar", v: "peligro", c: "¿Rechazar esta solicitud?" }]
    : x.estado === "confirmada" ? [{ estado: "en_curso", t: "Cliente llegó", v: "verde" }, { estado: "cancelada", t: "Cancelar", v: "peligro", c: "¿Cancelar esta reserva?" }]
    : x.estado === "en_curso" ? [{ estado: "finalizada", t: "Finalizar", v: "sutil" }]
    : [];
  return (
    <li className="rounded-xl border border-marfil/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium"><span>{formatoFechaCorta(x.inicio)}</span> · {formatoHora(x.inicio)} – {formatoHora(x.fin)} · {mesa}</p>
          <p className="mt-1 text-sm text-marfil/60">{x.nombre} · <a href={`tel:+57${x.celular}`} className="hover:text-oro">{x.celular}</a> · {x.correo}</p>
          <p className="mt-1 font-mono text-xs text-marfil/40">{x.codigo} · {formatoCOP(x.valorEstimado, "tarifa por confirmar")}</p>
        </div>
        <Insignia tono={ui.tono}>{ui.texto}</Insignia>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {transiciones.map((t) => (
          <FormAccion key={t.estado} accion={cambiarEstadoReserva} confirmar={t.c}>
            <input type="hidden" name="id" value={x.id} />
            <input type="hidden" name="estado" value={t.estado} />
            <BotonEnviar variante={t.v}>{t.t}</BotonEnviar>
          </FormAccion>
        ))}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs uppercase tracking-[0.12em] text-marfil/50 hover:text-oro">Reprogramar · observaciones · historial</summary>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <FormAccion accion={reprogramarReserva} className="space-y-2">
            <input type="hidden" name="id" value={x.id} />
            <div className="grid grid-cols-2 gap-2">
              <div><Etq>Fecha</Etq><input type="date" name="fecha" defaultValue={fechaLocal.slice(0, 10)} className={campoAdmin} required /></div>
              <div><Etq>Hora</Etq><input type="time" name="hora" step={1800} defaultValue={fechaLocal.slice(11, 16)} className={campoAdmin} required /></div>
              <div><Etq>Minutos</Etq><input type="number" name="duracion" min={30} step={30} defaultValue={dur} className={campoAdmin} /></div>
              <div><Etq>Mesa</Etq><select name="mesaId" defaultValue={x.mesaId} className={campoAdmin}>{mesas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select></div>
            </div>
            <BotonEnviar variante="sutil">Reprogramar</BotonEnviar>
          </FormAccion>
          <FormAccion accion={guardarObservacion} className="space-y-2">
            <input type="hidden" name="id" value={x.id} />
            <Etq>Observaciones internas</Etq>
            <textarea name="observaciones" defaultValue={x.observaciones} maxLength={500} className={cn(campoAdmin, "min-h-24")} />
            <BotonEnviar variante="sutil">Guardar</BotonEnviar>
          </FormAccion>
          <div>
            <Etq>Historial</Etq>
            <ol className="space-y-1.5 text-xs text-marfil/60">
              {x.historial.map((h, i) => <li key={i}><span className="text-marfil/40">{formatoFecha(h.fecha).split(",")[0]} {formatoHora(h.fecha)}</span> · {h.accion}</li>)}
            </ol>
          </div>
        </div>
      </details>
    </li>
  );
}
