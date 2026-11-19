import Link from "next/link";
import { Insignia } from "@/components/ui/primitives";
import { Kpi, Panel, TituloAdmin, Vacio } from "@/components/admin/ui";
import { ESTADO_RESERVA_UI } from "@/lib/estados";
import { estadoMesa } from "@/lib/availability";
import { repoOError } from "@/lib/data";
import { formatoCOP } from "@/lib/format";
import { formatoFechaCorta, formatoHora, hoyBogota, instanteBogota, sumarDias } from "@/lib/time";

export default async function Dashboard() {
  const r = repoOError();
  const hoy = hoyBogota();
  const ahora = new Date();
  const desde = instanteBogota(hoy, 0).toISOString();
  const hasta = instanteBogota(hoy, 1440 + 360).toISOString(); // incluye la madrugada
  const [mesas, reservasHoy, proximas, bloqueos, inscClase, torneos, solicitudes, mensajes, sesiones, clases] = await Promise.all([
    r.listarMesas(), r.listarReservas(desde, hasta), r.listarReservas(ahora.toISOString(), instanteBogota(sumarDias(hoy, 8), 0).toISOString()),
    r.listarBloqueos(ahora.toISOString(), new Date(ahora.getTime() + 60_000).toISOString()), r.listarInscripcionesClase(), r.listarTorneos(),
    r.listarSolicitudesEvento(), r.listarMensajes(), r.listarSesiones(), r.listarClases(),
  ]);

  const activasHoy = reservasHoy.filter((x) => ["pendiente", "confirmada", "en_curso"].includes(x.estado));
  const ahoraRango = { inicio: ahora.getTime(), fin: ahora.getTime() + 60_000 };
  const estadoAhora = mesas.filter((m) => m.activa).map((m) => ({ m, e: estadoMesa(m, ahoraRango, reservasHoy, bloqueos) }));
  const ocupadas = estadoAhora.filter((x) => x.e === "ocupada" || x.e === "reservada").length;
  const pendientes = proximas.filter((x) => x.estado === "pendiente");
  const ingresoEstimado = activasHoy.reduce((a, x) => a + (x.valorEstimado ?? 0), 0);
  const proxTorneos = torneos.filter((t) => new Date(t.fecha) > ahora && t.estado !== "cancelado").slice(0, 3);
  const nombreMesa = (id: string) => mesas.find((m) => m.id === id)?.nombre ?? "—";

  return (
    <>
      <TituloAdmin titulo="Panel" texto={`Hoy, ${formatoFechaCorta(ahora)} · hora de Medellín`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi etiqueta="Reservas de hoy" valor={activasHoy.length} detalle={`${activasHoy.filter((x) => x.estado === "pendiente").length} pendientes`} />
        <Kpi etiqueta="Mesas ocupadas ahora" valor={`${ocupadas}/${estadoAhora.length}`} />
        <Kpi etiqueta="Solicitudes por confirmar" valor={pendientes.length} detalle="próximos 7 días" />
        <Kpi etiqueta="Valor estimado hoy" valor={ingresoEstimado ? formatoCOP(ingresoEstimado) : "—"} detalle="Según tarifas configuradas" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel titulo="Próximas reservas" className="xl:col-span-2" acciones={<Link href="/admin/reservas" className="text-xs uppercase tracking-[0.14em] text-oro">Gestionar →</Link>}>
          {proximas.length === 0 ? <Vacio>No hay reservas próximas.</Vacio> : (
            <ul className="divide-y divide-marfil/5">
              {proximas.slice(0, 10).map((x) => (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{formatoFechaCorta(x.inicio)} · {formatoHora(x.inicio)}</span>
                    <span className="ml-2 text-marfil/50">{nombreMesa(x.mesaId)} · {x.nombre}</span>
                  </span>
                  <Insignia tono={ESTADO_RESERVA_UI[x.estado].tono}>{ESTADO_RESERVA_UI[x.estado].texto}</Insignia>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel titulo="Mesas ahora">
          {estadoAhora.length === 0 ? <Vacio>No hay mesas activas.</Vacio> : (
            <ul className="grid grid-cols-2 gap-2">
              {estadoAhora.map(({ m, e }) => (
                <li key={m.id} className="rounded-lg border border-marfil/10 p-3 text-sm">
                  <p className="font-medium">{m.nombre}</p>
                  <p className="text-xs capitalize text-marfil/50">{m.modalidad} · {e}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel titulo="Inscripciones a clases" acciones={<Link href="/admin/escuela" className="text-xs uppercase tracking-[0.14em] text-oro">Ver →</Link>}>
          <p className="font-display text-4xl text-oro">{inscClase.filter((i) => i.estado !== "cancelada").length}</p>
          <p className="text-xs text-marfil/50">{inscClase.filter((i) => i.estado === "pendiente").length} pendientes · {sesiones.filter((s) => new Date(s.inicio) > ahora).length} horarios próximos · {clases.filter((c) => c.activa).length} programas activos</p>
        </Panel>

        <Panel titulo="Próximos torneos" acciones={<Link href="/admin/torneos" className="text-xs uppercase tracking-[0.14em] text-oro">Ver →</Link>}>
          {proxTorneos.length === 0 ? <Vacio>Sin torneos programados.</Vacio> : (
            <ul className="space-y-2 text-sm">{proxTorneos.map((t) => <li key={t.id}><span>{formatoFechaCorta(t.fecha)}</span> · {t.nombre}{!t.publicado && <span className="text-marfil/40"> (no publicado)</span>}</li>)}</ul>
          )}
        </Panel>

        <Panel titulo="Bandeja" acciones={<Link href="/admin/eventos" className="text-xs uppercase tracking-[0.14em] text-oro">Ver →</Link>}>
          <p className="text-sm"><strong className="text-oro">{solicitudes.filter((s) => s.estado === "nueva").length}</strong> solicitudes de eventos nuevas</p>
          <p className="mt-2 text-sm"><strong className="text-oro">{mensajes.filter((m) => !m.leido).length}</strong> mensajes sin leer</p>
        </Panel>
      </div>
    </>
  );
}
