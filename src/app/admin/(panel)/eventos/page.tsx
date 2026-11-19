import { actualizarSolicitud, marcarLeido } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Panel, TituloAdmin, Vacio, campoAdmin } from "@/components/admin/ui";
import { Insignia } from "@/components/ui/primitives";
import { repoOError } from "@/lib/data";
import { formatoFechaCorta, formatoFechaLocal, formatoHora } from "@/lib/time";
import { TIPOS_EVENTO } from "@/lib/types";

const ESTADOS = { nueva: "Nueva", en_revision: "En revisión", aprobada: "Aprobada", rechazada: "Rechazada", cerrada: "Cerrada" } as const;

export default async function AdminEventos() {
  const r = repoOError();
  const [solicitudes, mensajes] = await Promise.all([r.listarSolicitudesEvento(), r.listarMensajes()]);
  return (
    <>
      <TituloAdmin titulo="Eventos y mensajes" texto="Solicitudes de eventos privados (sujetas a aprobación) y mensajes del formulario de contacto." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel titulo={`Solicitudes de eventos (${solicitudes.length})`}>
          {solicitudes.length === 0 ? <Vacio>Sin solicitudes.</Vacio> : (
            <ul className="space-y-3">
              {solicitudes.map((s) => (
                <li key={s.id} className="rounded-xl border border-marfil/10 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{TIPOS_EVENTO.find((t) => t.id === s.tipo)?.nombre} · <span className="first-letter:uppercase">{formatoFechaLocal(s.fecha)}</span> · {s.participantes} personas</p>
                    <Insignia tono={s.estado === "aprobada" ? "ok" : s.estado === "rechazada" ? "error" : s.estado === "nueva" ? "alerta" : "neutro"}>{ESTADOS[s.estado]}</Insignia>
                  </div>
                  <p className="mt-1 text-marfil/60">{s.nombre}{s.empresa ? ` (${s.empresa})` : ""} · {s.celular} · {s.correo}</p>
                  {s.mensaje && <p className="mt-2 text-marfil/75">“{s.mensaje}”</p>}
                  <p className="mt-1 font-mono text-xs text-marfil/35">{s.codigo}</p>
                  <FormAccion accion={actualizarSolicitud} className="mt-3 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <select name="estado" defaultValue={s.estado} className={`${campoAdmin} !w-40`}>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <input name="notas" defaultValue={s.notas} placeholder="Notas internas" className={`${campoAdmin} flex-1`} />
                    <BotonEnviar variante="sutil">Guardar</BotonEnviar>
                  </FormAccion>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel titulo={`Mensajes (${mensajes.filter((m) => !m.leido).length} sin leer)`}>
          {mensajes.length === 0 ? <Vacio>Sin mensajes.</Vacio> : (
            <ul className="space-y-3">
              {mensajes.map((m) => (
                <li key={m.id} className={`rounded-xl border p-4 text-sm ${m.leido ? "border-marfil/5 opacity-60" : "border-oro/30"}`}>
                  <div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{m.nombre} · <span className="capitalize text-oro">{m.asunto}</span></p><span className="text-xs text-marfil/40">{formatoFechaCorta(m.creadoEn)} {formatoHora(m.creadoEn)}</span></div>
                  <p className="text-marfil/55">{m.correo}{m.celular ? ` · ${m.celular}` : ""}</p>
                  <p className="mt-2 whitespace-pre-line text-marfil/80">{m.mensaje}</p>
                  {!m.leido && <FormAccion accion={marcarLeido} className="mt-3"><input type="hidden" name="id" value={m.id} /><BotonEnviar variante="sutil">Marcar como leído</BotonEnviar></FormAccion>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
