import { crearBloqueo, eliminarBloqueo, guardarMesa } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Etq, Panel, TituloAdmin, Vacio, campoAdmin } from "@/components/admin/ui";
import { repoOError } from "@/lib/data";
import { formatoFechaCorta, formatoHora, hoyBogota, instanteBogota, sumarDias } from "@/lib/time";
import type { Mesa } from "@/lib/types";

export default async function AdminMesas() {
  const r = repoOError();
  const hoy = hoyBogota();
  const [mesas, bloqueos] = await Promise.all([r.listarMesas(), r.listarBloqueos(new Date().toISOString(), instanteBogota(sumarDias(hoy, 60), 0).toISOString())]);
  const nombre = (id: string) => mesas.find((m) => m.id === id)?.nombre ?? "—";

  return (
    <>
      <TituloAdmin titulo="Mesas" texto="Inventario, modalidad, tarifa por hora (COP) y mantenimiento. El inventario inicial es de ejemplo: ajústelo al real del club." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel titulo="Inventario">
          <ul className="space-y-3">
            {mesas.map((m) => <li key={m.id}><FormMesa m={m} /></li>)}
          </ul>
          <details className="mt-5">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-oro">+ Agregar mesa</summary>
            <div className="mt-3"><FormMesa /></div>
          </details>
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Bloquear horario">
            <FormAccion accion={crearBloqueo} className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Etq>Mesa</Etq>
                <select name="mesaId" className={campoAdmin} required>
                  <option value="todas">Todas las mesas</option>
                  {mesas.map((m) => <option key={m.id} value={m.id}>{m.nombre} · {m.modalidad}</option>)}
                </select>
              </div>
              <div><Etq>Día operativo</Etq><input type="date" name="fecha" defaultValue={hoy} className={campoAdmin} required /></div>
              <div><Etq>Tipo</Etq>
                <select name="tipo" className={campoAdmin}>
                  <option value="bloqueo">Bloqueo</option>
                  <option value="ocupada">Ocupada (cliente sin reserva)</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div><Etq>Desde</Etq><input type="time" name="desde" defaultValue="09:00" className={campoAdmin} required /></div>
              <div><Etq>Hasta</Etq><input type="time" name="hasta" defaultValue="12:00" className={campoAdmin} required /></div>
              <div className="col-span-2"><Etq>Motivo</Etq><input name="motivo" maxLength={120} className={campoAdmin} placeholder="Ej. evento privado, cambio de paño" /></div>
              <p className="col-span-2 text-xs text-marfil/45">Las horas antes de las 6:00 a. m. se toman como madrugada del día operativo.</p>
              <div className="col-span-2"><BotonEnviar>Bloquear</BotonEnviar></div>
            </FormAccion>
          </Panel>

          <Panel titulo="Bloqueos próximos">
            {bloqueos.length === 0 ? <Vacio>No hay bloqueos programados.</Vacio> : (
              <ul className="divide-y divide-marfil/5">
                {bloqueos.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span><span>{formatoFechaCorta(b.inicio)}</span> {formatoHora(b.inicio)}–{formatoHora(b.fin)} · {nombre(b.mesaId)} · <span className="capitalize text-marfil/55">{b.tipo}</span>{b.motivo && <span className="text-marfil/40"> · {b.motivo}</span>}</span>
                    <FormAccion accion={eliminarBloqueo} confirmar="¿Eliminar este bloqueo?"><input type="hidden" name="id" value={b.id} /><BotonEnviar variante="peligro">Quitar</BotonEnviar></FormAccion>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function FormMesa({ m }: { m?: Mesa }) {
  return (
    <FormAccion accion={guardarMesa} className="rounded-xl border border-marfil/10 p-4">
      {m && <input type="hidden" name="id" value={m.id} />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div><Etq>Nombre</Etq><input name="nombre" defaultValue={m?.nombre} required className={campoAdmin} /></div>
        <div><Etq>Modalidad</Etq>
          <select name="modalidad" defaultValue={m?.modalidad ?? "carambola"} className={campoAdmin}><option value="carambola">Carambola</option><option value="pool">Pool</option></select>
        </div>
        <div><Etq>Tarifa/hora (COP)</Etq><input name="tarifaHora" type="number" min={0} step={500} defaultValue={m?.tarifaHora ?? ""} placeholder="Por confirmar" className={campoAdmin} /></div>
        <div><Etq>Orden</Etq><input name="orden" type="number" defaultValue={m?.orden ?? 99} className={campoAdmin} /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="activa" defaultChecked={m?.activa ?? true} className="accent-[#c5a36a]" />Activa</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="mantenimiento" defaultChecked={m?.mantenimiento} className="accent-[#c5a36a]" />En mantenimiento</label>
        <input name="notas" defaultValue={m?.notas} placeholder="Notas internas" className={`${campoAdmin} flex-1`} />
        <BotonEnviar variante={m ? "sutil" : "oro"}>{m ? "Guardar" : "Crear mesa"}</BotonEnviar>
      </div>
    </FormAccion>
  );
}
